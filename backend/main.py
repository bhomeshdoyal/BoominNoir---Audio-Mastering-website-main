from pathlib import Path
import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from analyzer import analyze_audio
from mastering import master_audio


BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"
AUDIO_DIR = PROJECT_DIR / "audio"
UPLOAD_DIR = AUDIO_DIR / "uploads"
MASTERED_DIR = AUDIO_DIR / "mastered"

for directory in (FRONTEND_DIR, AUDIO_DIR, UPLOAD_DIR, MASTERED_DIR):
    directory.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = 150 * 1024 * 1024
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}
ALLOWED_PRESETS = {"balanced", "clean", "loud", "club", "dark"}

app = FastAPI(
    title="BoominNoir MASTERLAB STUDIO",
    description="Professional-style audio mastering engine by BoominNoir.",
    version="1.1.0",
)

# The frontend is served by this same FastAPI app, so CORS is not required
# for normal use. It remains permissive for future separate frontends.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def home():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/health")
def health():
    return {"status": "online", "service": "BoominNoir MASTERLAB STUDIO", "version": "1.1.0"}


@app.post("/master")
async def master_track(
    file: UploadFile = File(...),
    preset: str = Form("balanced"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected.")

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format. Use WAV, MP3, FLAC, OGG or M4A.",
        )

    if preset not in ALLOWED_PRESETS:
        preset = "balanced"

    file_id = uuid.uuid4().hex
    input_path = UPLOAD_DIR / f"{file_id}{extension}"
    output_path = MASTERED_DIR / f"{file_id}_mastered.wav"

    total_bytes = 0
    try:
        with input_path.open("wb") as destination:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail="File is too large. Maximum upload size is 150 MB.",
                    )
                destination.write(chunk)

        analysis_before = analyze_audio(str(input_path))
        master_audio(str(input_path), str(output_path), preset)
        analysis_after = analyze_audio(str(output_path))

        # The original upload is no longer needed because the browser already
        # has its own local preview URL.
        try:
            input_path.unlink(missing_ok=True)
        except Exception:
            pass

        return {
            "success": True,
            "message": "Track mastered successfully.",
            "preset": preset,
            "original": analysis_before,
            "mastered": analysis_after,
            "mastered_url": f"/audio/mastered/{output_path.name}",
        }

    except HTTPException:
        input_path.unlink(missing_ok=True)
        output_path.unlink(missing_ok=True)
        raise
    except Exception as error:
        input_path.unlink(missing_ok=True)
        output_path.unlink(missing_ok=True)
        print(f"MASTERING ERROR: {type(error).__name__}: {error}")
        raise HTTPException(
            status_code=500,
            detail="The track could not be mastered. Please try another audio file.",
        )
    finally:
        await file.close()


@app.get("/healthz")
def healthz():
    return {"ok": True}

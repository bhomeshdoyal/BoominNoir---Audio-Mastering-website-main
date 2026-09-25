import numpy as np
import librosa
import pyloudnorm as pyln
from pydub import AudioSegment


def _load_audio(file_path):
    try:
        audio, sr = librosa.load(file_path, sr=None, mono=False)
        return audio, sr
    except Exception:
        segment = AudioSegment.from_file(file_path)
        sr = segment.frame_rate
        channels = segment.channels
        samples = np.array(segment.get_array_of_samples(), dtype=np.float32)

        scale = float(1 << (8 * segment.sample_width - 1))
        samples /= scale

        if channels > 1:
            samples = samples.reshape((-1, channels)).T
        return samples, sr


def analyze_audio(file_path):
    audio, sr = _load_audio(file_path)

    if audio.ndim == 1:
        mono = audio
    else:
        mono = np.mean(audio, axis=0)

    duration = len(mono) / sr if sr else 0

    rms = np.sqrt(np.mean(mono ** 2))
    rms_db = 20 * np.log10(rms) if rms > 0 else -100

    peak = np.max(np.abs(mono))
    peak_db = 20 * np.log10(peak) if peak > 0 else -100

    meter = pyln.Meter(sr)
    try:
        loudness = meter.integrated_loudness(mono.astype(np.float64))
    except Exception:
        loudness = -100

    return {
        "duration": round(float(duration), 2),
        "rms_db": round(float(rms_db), 2),
        "peak_db": round(float(peak_db), 2),
        "lufs": round(float(loudness), 2),
        "sample_rate": int(sr),
        "channels": int(1 if audio.ndim == 1 else audio.shape[0]),
    }

# BoominNoir AI Audio Mastering Studio 🎛️

A free, local AI-powered audio mastering engine and workstation interface. Designed for electronic, techno, and modern music producers to achieve competitive loudness, punchy low-end, and balanced dynamics without sending tracks to third-party cloud servers.

Created by **BoominNoir**  
Instagram: [@boominnoir](https://instagram.com/boominnoir)

---

## 📜 Terms of Use & Mandatory Attribution

This software and its source code are completely free to use for personal and commercial production under these terms:

1. **Mastered Music Credit:** If you master a song, track, or stem with this tool and publish, stream, or share it anywhere (Spotify, YouTube, Soundcloud, Instagram, TikTok, etc.), you **must credit "Mastered by BoominNoir"** and tag [@boominnoir](https://instagram.com/boominnoir).
2. **Code & Derivatives Credit:** If you copy, fork, adapt, or build upon this source code or UI in another project, you must retain this notice and prominently credit **BoominNoir** with a direct link to this repository.

---

## ✨ Key Features

- **Local DSP Engine:** Masters WAV, MP3, FLAC, OGG, and M4A directly on your computer.
- **Mastering Styles:** Tailored processing curves (Balanced, Warm, Open).
- **A/B Instant Switching:** Compare your original mix against the master seamlessly in real time.
- **Animated Audio Deck:** Dynamic animated waveforms, visual frequency meters, and live telemetry (LUFS, True Peak, Duration).
- **24-Bit Export:** Download production-ready master files with one click.

---

## 🚀 Quickstart Guide (How to Run)

### 1. Prerequisites
Install [Python 3.10+](https://www.python.org/downloads/) on your system (make sure **"Add Python to PATH"** is checked during installation).

### 2. Clone or Download the Project
```bash
git clone [https://github.com/YOUR_USERNAME/BoominNoir-AI-Audio-Mastering-Website.git](https://github.com/YOUR_USERNAME/BoominNoir-AI-Audio-Mastering-Website.git)
cd BoominNoir-AI-Audio-Mastering-Website

## Render deployment

This repository is prepared to run as a single Docker Web Service on Render.

- Runtime: Docker
- Health check: `/health`
- Start command is defined in `Dockerfile`
- FFmpeg is installed for MP3/M4A decoding
- Maximum upload size: 150 MB
- The frontend and API are served from the same domain

Connect this repository to Render as a **Web Service** and deploy from the `main` branch.

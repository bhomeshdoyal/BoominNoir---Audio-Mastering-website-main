import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt


# ==========================================
# NORMALIZE
# ==========================================

def normalize(audio, peak=0.95):

    current_peak = np.max(
        np.abs(audio)
    )

    if current_peak == 0:
        return audio

    return audio * (
        peak / current_peak
    )


# ==========================================
# LOW SHELF
# ==========================================

def low_shelf(
    audio,
    sr,
    gain_db=1.5
):

    cutoff = 120

    sos = butter(
        2,
        cutoff,
        btype="lowpass",
        fs=sr,
        output="sos"
    )

    low = sosfilt(
        sos,
        audio
    )

    gain = 10 ** (
        gain_db / 20
    )

    return audio + (
        low * (gain - 1)
    )


# ==========================================
# HIGH SHELF
# ==========================================

def high_shelf(
    audio,
    sr,
    gain_db=1.0
):

    cutoff = 8000

    sos = butter(
        2,
        cutoff,
        btype="highpass",
        fs=sr,
        output="sos"
    )

    high = sosfilt(
        sos,
        audio
    )

    gain = 10 ** (
        gain_db / 20
    )

    return audio + (
        high * (gain - 1)
    )


# ==========================================
# SIMPLE COMPRESSOR
# ==========================================

def compressor(
    audio,
    threshold=0.65,
    ratio=3.0
):

    envelope = np.abs(audio)

    gain = np.ones_like(
        audio
    )

    over = envelope > threshold

    if np.any(over):

        compressed = (
            threshold
            + (
                envelope[over]
                - threshold
            ) / ratio
        )

        gain[over] = (
            compressed
            / (
                envelope[over]
                + 1e-8
            )
        )

    return audio * gain


# ==========================================
# SOFT CLIPPER
# ==========================================

def soft_clip(
    audio,
    amount=1.3
):

    return np.tanh(
        audio * amount
    )


# ==========================================
# LIMITER
# ==========================================

def limiter(
    audio,
    ceiling=0.95
):

    return np.clip(
        audio,
        -ceiling,
        ceiling
    )


# ==========================================
# MASTER AUDIO
# ==========================================

def master_audio(
    input_file,
    output_file,
    preset="balanced"
):

    # --------------------------------------
    # LOAD AUDIO
    # --------------------------------------

    audio, sr = sf.read(
        input_file,
        always_2d=True
    )

    # --------------------------------------
    # PRESET SETTINGS
    # --------------------------------------

    if preset == "clean":

        bass_gain = 1.0
        treble_gain = 0.5
        compression_ratio = 2.0
        clip_amount = 1.05


    elif preset == "loud":

        bass_gain = 1.5
        treble_gain = 1.0
        compression_ratio = 4.0
        clip_amount = 1.35


    elif preset == "club":

        bass_gain = 2.0
        treble_gain = 1.0
        compression_ratio = 4.0
        clip_amount = 1.5


    elif preset == "dark":

        bass_gain = 2.0
        treble_gain = -0.5
        compression_ratio = 3.0
        clip_amount = 1.25


    else:

        bass_gain = 1.5
        treble_gain = 0.8
        compression_ratio = 3.0
        clip_amount = 1.2


    # --------------------------------------
    # PROCESS EACH CHANNEL
    # --------------------------------------

    processed_channels = []


    for channel in range(
        audio.shape[1]
    ):

        signal = audio[
            :, channel
        ].astype(
            np.float64
        )


        # EQ

        signal = low_shelf(
            signal,
            sr,
            bass_gain
        )


        signal = high_shelf(
            signal,
            sr,
            treble_gain
        )


        # Compression

        signal = compressor(
            signal,
            threshold=0.65,
            ratio=compression_ratio
        )


        # Soft clipping

        signal = soft_clip(
            signal,
            clip_amount
        )


        processed_channels.append(
            signal
        )


    # --------------------------------------
    # REBUILD STEREO
    # --------------------------------------

    output = np.column_stack(
        processed_channels
    )


    # --------------------------------------
    # NORMALIZE
    # --------------------------------------

    output = normalize(
        output,
        peak=0.95
    )


    # --------------------------------------
    # FINAL LIMITER
    # --------------------------------------

    output = limiter(
        output,
        ceiling=0.95
    )


    # --------------------------------------
    # WRITE WAV
    # --------------------------------------

    sf.write(
        output_file,
        output,
        sr,
        subtype="PCM_24"
    )


    return output_file
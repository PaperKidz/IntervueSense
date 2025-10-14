import librosa
import numpy as np

def detect_voice_breaks(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
    
    breaks = []
    threshold = np.mean(rms) * 0.3
    
    for i in range(1, len(rms)):
        if rms[i-1] > threshold and rms[i] < threshold:
            breaks.append(i)
    
    total_breaks = len(breaks)
    duration = librosa.get_duration(y=y, sr=sr)
    breaks_per_minute = (total_breaks / duration) * 60 if duration > 0 else 0
    fluency_score = max(0, 100 - (breaks_per_minute * 10))
    
    return {
        'total_breaks': int(total_breaks),
        'breaks_per_minute': float(breaks_per_minute),
        'fluency_score': float(fluency_score)
    }

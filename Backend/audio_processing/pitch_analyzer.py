import librosa
import numpy as np

def analyze_pitch(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    
    pitch_values = []
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            pitch_values.append(pitch)
    
    if len(pitch_values) == 0:
        return {
            'mean_pitch': 0,
            'pitch_variance': 0,
            'pitch_range': 0,
            'stability_score': 0
        }
    
    pitch_values = np.array(pitch_values)
    mean_pitch = np.mean(pitch_values)
    pitch_std = np.std(pitch_values)
    pitch_range = np.max(pitch_values) - np.min(pitch_values)
    stability_score = max(0, 100 - (pitch_std / mean_pitch * 100)) if mean_pitch > 0 else 0
    
    return {
        'mean_pitch': float(mean_pitch),
        'pitch_variance': float(pitch_std),
        'pitch_range': float(pitch_range),
        'stability_score': float(stability_score)
    }

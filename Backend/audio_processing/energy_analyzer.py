import librosa
import numpy as np

def analyze_energy(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)
    rms = librosa.feature.rms(y=y)[0]
    
    mean_energy = np.mean(rms)
    energy_std = np.std(rms)
    max_energy = np.max(rms)
    min_energy = np.min(rms)
    consistency_score = max(0, 100 - (energy_std / mean_energy * 100)) if mean_energy > 0 else 0
    
    return {
        'mean_energy': float(mean_energy),
        'energy_variance': float(energy_std),
        'max_energy': float(max_energy),
        'min_energy': float(min_energy),
        'consistency_score': float(consistency_score)
    }

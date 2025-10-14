import librosa
import numpy as np

def analyze_speech_rate(audio_path):
    y, sr = librosa.load(audio_path, sr=16000)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    
    syllable_count = len(onset_times)
    word_count = syllable_count / 1.5
    duration = librosa.get_duration(y=y, sr=sr)
    words_per_minute = (word_count / duration) * 60 if duration > 0 else 0
    
    if words_per_minute < 100:
        rate_category = 'slow'
        confidence_impact = -10
    elif 120 <= words_per_minute <= 160:
        rate_category = 'optimal'
        confidence_impact = 10
    elif words_per_minute > 180:
        rate_category = 'fast'
        confidence_impact = -15
    else:
        rate_category = 'moderate'
        confidence_impact = 0
    
    return {
        'words_per_minute': float(words_per_minute),
        'syllable_count': int(syllable_count),
        'rate_category': rate_category,
        'confidence_impact': float(confidence_impact)
    }

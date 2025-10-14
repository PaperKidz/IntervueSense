def calculate_nervousness_score(dsp_results, text_results):
    nervousness = 30.0
    
    pitch_variance = dsp_results.get('pitch', {}).get('pitch_variance', 0)
    mean_pitch = dsp_results.get('pitch', {}).get('mean_pitch', 1)
    if mean_pitch > 0:
        pitch_instability = (pitch_variance / mean_pitch) * 100
        nervousness += min(20, pitch_instability * 0.3)
    
    energy_variance = dsp_results.get('energy', {}).get('energy_variance', 0)
    mean_energy = dsp_results.get('energy', {}).get('mean_energy', 1)
    if mean_energy > 0:
        energy_instability = (energy_variance / mean_energy) * 100
        nervousness += min(15, energy_instability * 0.25)
    
    breaks_per_min = dsp_results.get('voice_breaks', {}).get('breaks_per_minute', 0)
    nervousness += min(15, breaks_per_min * 3)
    
    wpm = dsp_results.get('speech_rate', {}).get('words_per_minute', 140)
    if wpm > 180:
        nervousness += min(10, (wpm - 180) * 0.2)
    
    filler_rate = text_results.get('filler_words', {}).get('filler_rate', 0)
    nervousness += min(15, filler_rate * 1.5)
    
    stammer_count = text_results.get('stammering', {}).get('stammer_count', 0)
    nervousness += min(10, stammer_count * 4)
    
    nervousness = max(0, min(100, nervousness))
    return round(nervousness, 2)

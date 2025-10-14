def calculate_confidence_score(dsp_results, text_results):
    confidence = 50.0
    
    pitch_score = dsp_results.get('pitch', {}).get('stability_score', 50)
    confidence += (pitch_score - 50) * 0.25
    
    energy_score = dsp_results.get('energy', {}).get('consistency_score', 50)
    confidence += (energy_score - 50) * 0.20
    
    rate_impact = dsp_results.get('speech_rate', {}).get('confidence_impact', 0)
    confidence += rate_impact * 0.15
    
    break_score = dsp_results.get('voice_breaks', {}).get('fluency_score', 50)
    confidence += (break_score - 50) * 0.10
    
    filler_penalty = text_results.get('filler_words', {}).get('confidence_penalty', 0)
    confidence -= filler_penalty * 0.15
    
    pause_impact = text_results.get('pauses', {}).get('confidence_impact', 0)
    confidence += pause_impact * 0.10
    
    stammer_penalty = text_results.get('stammering', {}).get('fluency_penalty', 0)
    confidence -= stammer_penalty * 0.05
    
    confidence = max(0, min(100, confidence))
    return round(confidence, 2)

def analyze_pauses(transcript, audio_duration):
    if not transcript or len(transcript.strip()) == 0:
        return {
            'estimated_pause_time': 0,
            'pause_percentage': 0,
            'confidence_impact': 0
        }
    
    words = transcript.split()
    word_count = len(words)
    expected_duration = (word_count / 150) * 60
    pause_time = max(0, audio_duration - expected_duration)
    pause_percentage = (pause_time / audio_duration * 100) if audio_duration > 0 else 0
    
    if pause_percentage < 10:
        confidence_impact = 5
    elif pause_percentage < 20:
        confidence_impact = 0
    elif pause_percentage < 30:
        confidence_impact = -10
    else:
        confidence_impact = -20
    
    return {
        'estimated_pause_time': float(pause_time),
        'pause_percentage': float(pause_percentage),
        'confidence_impact': float(confidence_impact)
    }

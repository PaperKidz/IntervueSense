import re

FILLER_WORDS = [
    'um', 'uh', 'uhm', 'umm', 'erm', 'ah', 'er',
    'like', 'you know', 'sort of', 'kind of', 'i mean',
    'actually', 'basically', 'literally', 'right', 'okay', 'so'
]

def detect_filler_words(transcript):
    if not transcript or len(transcript.strip()) == 0:
        return {
            'filler_count': 0,
            'filler_rate': 0,
            'filler_words_found': [],
            'confidence_penalty': 0
        }
    
    text_lower = transcript.lower()
    filler_counts = {}
    total_fillers = 0
    
    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, text_lower)
        count = len(matches)
        
        if count > 0:
            filler_counts[filler] = count
            total_fillers += count
    
    words = transcript.split()
    total_words = len(words)
    filler_rate = (total_fillers / total_words * 100) if total_words > 0 else 0
    confidence_penalty = min(30, filler_rate * 2)
    
    return {
        'filler_count': int(total_fillers),
        'filler_rate': float(filler_rate),
        'filler_words_found': filler_counts,
        'confidence_penalty': float(confidence_penalty)
    }

import re
from difflib import SequenceMatcher

def detect_stammering(transcript):
    if not transcript or len(transcript.strip()) == 0:
        return {
            'stammer_count': 0,
            'repeated_words': [],
            'fluency_penalty': 0
        }
    
    words = transcript.lower().split()
    repeated_words = []
    stammer_count = 0
    
    i = 0
    while i < len(words) - 1:
        current_word = words[i]
        next_word = words[i + 1]
        similarity = SequenceMatcher(None, current_word, next_word).ratio()
        
        if similarity > 0.8:
            repeated_words.append(f'{current_word} -> {next_word}')
            stammer_count += 1
            i += 2
        else:
            i += 1
    
    partial_stammers = re.findall(r'\b(\w+)-\1', transcript.lower())
    stammer_count += len(partial_stammers)
    fluency_penalty = min(25, stammer_count * 5)
    
    return {
        'stammer_count': int(stammer_count),
        'repeated_words': repeated_words,
        'fluency_penalty': float(fluency_penalty)
    }

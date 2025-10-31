from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import base64
import numpy as np
from PIL import Image
import io
import traceback
import logging
import speech_recognition as sr
import os
import tempfile
from pydub import AudioSegment
from openai import OpenAI
from dotenv import load_dotenv
import sys

load_dotenv()

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from audio_processing.pitch_analyzer import analyze_pitch
from audio_processing.energy_analyzer import analyze_energy
from audio_processing.voice_break_detector import detect_voice_breaks
from audio_processing.speech_rate_analyzer import analyze_speech_rate
from text_processing.filler_word_detector import detect_filler_words
from text_processing.stammering_detector import detect_stammering
from text_processing.pause_analyzer import analyze_pauses
from scoring.confidence_scorer import calculate_confidence_score
from scoring.nervousness_scorer import calculate_nervousness_score

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

try:
    faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if faceCascade.empty():
        logger.error("Failed to load face cascade classifier")
except Exception as e:
    logger.error(f"Error loading cascade: {e}")

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "error": "No image provided"}), 400

        image_data = data['image'].split('base64,')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        result = DeepFace.analyze(
            frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=True
        )
        
        if not result or not isinstance(result, list) or 'dominant_emotion' not in result[0]:
             return jsonify({"success": False, "error": "No face detected", "face_count": 0, "faces": []})

        face_data = result[0]
        region = face_data.get('region', {})
        faces_coords = [{'x': region.get('x'), 'y': region.get('y'), 'width': region.get('w'), 'height': region.get('h')}] if region else []

        response = {
            "success": True,
            "dominant_emotion": face_data['dominant_emotion'],
            "emotions": {k: float(v) for k, v in face_data['emotion'].items()},
            "faces": faces_coords,
            "face_count": len(result)
        }
        return jsonify(response)

    except Exception as e:
        logger.error(f"Exception in analyze-emotion: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    webm_path = None
    wav_path = None
    try:
        data = request.get_json()
        if not data or 'audio' not in data:
            return jsonify({"success": False, "error": "No audio provided"}), 400

        audio_data = data['audio'].split('base64,')[1]
        audio_bytes = base64.b64decode(audio_data)
        
        if len(audio_bytes) < 1000:
            return jsonify({"success": False, "error": "Audio too short", "transcription": None}), 200

        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as webm_file:
            webm_file.write(audio_bytes)
            webm_path = webm_file.name
        
        wav_path = webm_path.replace('.webm', '.wav')
        
        import subprocess
        try:
            subprocess.run([
                r"ffmpeg",
                "-i", webm_path,
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                wav_path,
                "-y"
            ], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg conversion failed: {e}")
            raise
        
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_for_stt = recognizer.record(source)
        
        transcription = recognizer.recognize_google(audio_for_stt)
        return jsonify({"success": True, "transcription": transcription})
        
    except sr.UnknownValueError:
        return jsonify({"success": False, "error": "Could not understand audio", "transcription": None}), 200
    except sr.RequestError as e:
        logger.error(f"Google API error: {e}")
        return jsonify({"success": False, "error": "Speech recognition service error"}), 500
    except Exception as e:
        logger.error(f"Exception: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500
    finally:
        if webm_path and os.path.exists(webm_path):
            try:
                os.unlink(webm_path)
            except:
                pass
        if wav_path and os.path.exists(wav_path):
            try:
                os.unlink(wav_path)
            except:
                pass

@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    try:
        data = request.get_json()
        
        if not data or 'question' not in data or 'answer' not in data:
            return jsonify({"success": False, "error": "Missing question or answer"}), 400

        question = data['question']
        answer = data['answer']

        # ✅ Escaped braces {{ }} to avoid Invalid format specifier
        prompt = f"""You are an expert interview coach with 15+ years of experience evaluating technical and behavioral interviews. Your goal is to provide encouraging, actionable feedback that helps candidates improve while generously acknowledging their strengths.

Question: {question}
Candidate's Answer: {answer}

EVALUATION PHILOSOPHY:
Focus on CONTENT and SUBSTANCE over delivery perfection. This is about evaluating ideas, not speech patterns.

CRITICAL - TRANSCRIPTION & DELIVERY TOLERANCE:
- COMPLETELY IGNORE: Grammatical errors, word repetitions, transcription artifacts, stutters
- COMPLETELY IGNORE: Awkward phrasing or sentence structure caused by speaking naturally
- FOCUS ON: The core message, key points, and overall substance of what they're communicating
- Remember: Nervousness affects delivery, not knowledge. Evaluate what they KNOW, not how smoothly they said it.

SCORING CALIBRATION (BE GENEROUS):

1-3: Completely off-topic, factually incorrect, or shows fundamental misunderstanding
4-5: Touches on the topic but missing major elements or significantly incomplete
6-7: Good, solid answer - addresses the question with reasonable detail (THIS SHOULD BE YOUR DEFAULT FOR DECENT ANSWERS)
8-9: Strong answer with specific examples, clear structure, and good depth
10: Truly exceptional - insightful, perfectly structured, goes above and beyond

IMPORTANT: If someone gives a reasonable answer that addresses the question with some substance, they should get AT LEAST a 6-7. Reserve low scores (1-5) only for answers that are genuinely problematic.

EVALUATION CRITERIA:

1. RELEVANCE (Does it answer the question?):
- Does the response directly address what was asked?
- Are the main points of the question covered?
- Stay focused on whether they understood and addressed the core question

2. CLARITY (Is the message understandable?):
- Can you follow their main points despite any delivery issues?
- Is there a general logical flow to their thinking?
- Would an interviewer understand what they're trying to communicate?
- IGNORE surface-level delivery issues - focus on whether the IDEAS are clear

3. DEPTH & QUALITY (How substantive is the content?):
- Are there specific examples or details (not just generic statements)?
- Does it demonstrate actual understanding or experience?
- For behavioral: Do they explain the situation, their actions, and results?
- For technical: Is the explanation reasonably accurate and detailed?

STRENGTHS - Look for and highlight:
- Specific examples with context and outcomes
- Clear problem-solving thinking or methodology
- Technical accuracy and understanding
- Good structure (even if imperfectly delivered)
- Self-awareness and learning mindset
- Any concrete details, numbers, or measurable results

IMPROVEMENTS - Focus on content gaps, not delivery:
- What key information is missing? (impact, specific actions, results)
- Where could they add more specific details or examples?
- What aspects of the question weren't fully addressed?
- Are there technical concepts that need more explanation?
- DON'T criticize filler words, stuttering, or transcription issues

RESPONSE FORMAT (Valid JSON):

{{
  "score": <number 1-10>,
  "clarity": <number 1-10>,
  "relevance": <number 1-10>,
  "strengths": "<2-3 specific, encouraging observations. Reference concrete elements from their answer. Be genuinely positive about what they did well.>",
  "improvements": "<2-3 actionable suggestions focused on CONTENT to add, not delivery to fix. Be constructive and specific.>",
  "feedback": "<2-3 sentences providing balanced, motivating feedback. Start positive, note one key growth area (content-focused), end with encouragement.>"
}}

FINAL REMINDERS:
- Be GENEROUS and ENCOURAGING - you're a coach, not a critic
- Default to 6-7 for solid answers, not 4-5
- Ignore ALL delivery and transcription issues
- Focus feedback on what content to add, not how to speak better
- If the answer is completely unrelated to the question, THEN use low scores (1-3)
- Make the candidate feel good about what they did well while showing them how to level up
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an encouraging interview coach who provides constructive, balanced feedback. You understand that candidates may be nervous and that transcription can introduce errors."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )

        evaluation = response.choices[0].message.content
        import json
        evaluation_data = json.loads(evaluation)
        
        return jsonify({
            "success": True,
            **evaluation_data
        })

    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": f"Evaluation error: {str(e)}"}), 500


@app.route('/api/analyze-voice-comprehensive', methods=['POST'])
def analyze_voice_comprehensive():
    """
    Performs comprehensive voice analysis with more lenient scoring
    """
    try:
        data = request.get_json()
        
        if not data or 'audio' not in data or 'transcript' not in data:
            return jsonify({
                "success": False,
                "error": "Missing audio or transcript"
            }), 400
        
        audio_data = data['audio'].split('base64,')[1]
        audio_bytes = base64.b64decode(audio_data)
        transcript = data['transcript']
        duration = data.get('duration', 0)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as webm_file:
            webm_file.write(audio_bytes)
            webm_path = webm_file.name
        
        wav_path = webm_path.replace('.webm', '.wav')
        
        try:
            import subprocess
            subprocess.run([
                r"ffmpeg",
                "-i", webm_path,
                "-acodec", "pcm_s16le",
                "-ar", "16000",
                "-ac", "1",
                wav_path,
                "-y"
            ], check=True, capture_output=True)
            
            # DSP Analysis
            pitch_results = analyze_pitch(wav_path)
            energy_results = analyze_energy(wav_path)
            voice_break_results = detect_voice_breaks(wav_path)
            speech_rate_results = analyze_speech_rate(wav_path)
            
            dsp_results = {
                'pitch': pitch_results,
                'energy': energy_results,
                'voice_breaks': voice_break_results,
                'speech_rate': speech_rate_results
            }
            
            # Text Analysis
            filler_results = detect_filler_words(transcript)
            stammer_results = detect_stammering(transcript)
            pause_results = analyze_pauses(transcript, duration)
            
            text_results = {
                'filler_words': filler_results,
                'stammering': stammer_results,
                'pauses': pause_results
            }
            
            # MORE LENIENT SCORING
            # Base confidence score (higher baseline)
            confidence_score = calculate_confidence_score(dsp_results, text_results)
            # Boost confidence by 15% to be more encouraging
            confidence_score = min(100, confidence_score * 1.15)
            
            # Nervousness (reduce impact)
            nervousness_score = calculate_nervousness_score(dsp_results, text_results)
            # Reduce nervousness score by 25%
            nervousness_score = nervousness_score * 0.75
            
            # Fluency (more forgiving)
            fluency_base = 100 - nervousness_score
            # Reduce penalties
            fluency_penalty = (
                filler_results.get('confidence_penalty', 0) * 0.15 +  # Reduced from 0.3
                stammer_results.get('fluency_penalty', 0) * 0.25      # Reduced from 0.5
            )
            fluency_score = max(40, fluency_base - fluency_penalty)  # Minimum 40% instead of 0%
            
            response = {
                "success": True,
                "scores": {
                    "confidence": round(confidence_score, 2),
                    "nervousness": round(nervousness_score, 2),
                    "fluency": round(fluency_score, 2)
                },
                "dsp_analysis": dsp_results,
                "text_analysis": text_results,
                "summary": {
                    "words_per_minute": speech_rate_results.get('words_per_minute', 0),
                    "filler_count": filler_results.get('filler_count', 0),
                    "stammer_count": stammer_results.get('stammer_count', 0),
                    "voice_breaks": voice_break_results.get('total_breaks', 0)
                }
            }
            
            return jsonify(response)
            
        finally:
            if os.path.exists(webm_path):
                os.unlink(webm_path)
            if os.path.exists(wav_path):
                os.unlink(wav_path)
    
    except Exception as e:
        logger.error(f"Voice analysis error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": f"Analysis error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("VirtueSense - Professional Interview Coach API")
    print("=" * 60)
    print("Server: http://localhost:5000")
    print("Status: Ready")
    print("=" * 60)
    app.run(debug=True, port=5000, host='0.0.0.0')
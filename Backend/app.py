from flask import Flask, request, jsonify
#from flask_cors import CORS
import cv2
from deepface import DeepFace
import base64
import numpy as np
from PIL import Image
import io
import traceback
import logging

app = Flask(__name__)
#CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize face cascade
try:
    faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    if faceCascade.empty():
        logger.error("Failed to load face cascade classifier")
except Exception as e:
    logger.error(f"Error loading cascade: {e}")

def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    return obj

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({"status": "ok", "message": "Emotion Detection API is running"})

@app.route('/api/analyze-emotion', methods=['POST', 'OPTIONS'])
def analyze_emotion():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        logger.info("\n" + "="*60)
        logger.info("🔍 Received analysis request")
        
        # Get image data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            logger.error("❌ No image in request")
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        logger.info("✓ Image data received")
        
        # Decode base64 image
        try:
            image_data = data['image']
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            
            image_bytes = base64.b64decode(image_data)
            logger.info(f"✓ Image decoded, size: {len(image_bytes)} bytes")
        except Exception as e:
            logger.error(f"❌ Failed to decode image: {e}")
            return jsonify({"success": False, "error": "Failed to decode image"}), 400
        
        # Convert to numpy array
        try:
            image = Image.open(io.BytesIO(image_bytes))
            frame = np.array(image)
            logger.info(f"✓ Image converted to array: {frame.shape}")
            
            # Convert RGB to BGR for OpenCV
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            elif len(frame.shape) == 2:
                frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        except Exception as e:
            logger.error(f"❌ Failed to process image: {e}")
            return jsonify({"success": False, "error": "Failed to process image"}), 400
        
        # Detect faces with Haar Cascade
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = faceCascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            logger.info(f"👤 Faces detected by Haar Cascade: {len(faces)}")
        except Exception as e:
            logger.error(f"❌ Face detection failed: {e}")
            faces = []
        
        # Try to analyze emotion with DeepFace
        result = None
        error_msg = None
        
        # Try multiple detector backends
        detectors = ['opencv', 'ssd', 'mtcnn', 'retinaface']
        
        for detector in detectors:
            try:
                logger.info(f"Attempting DeepFace analysis with {detector}...")
                result = DeepFace.analyze(
                    frame, 
                    actions=['emotion'], 
                    enforce_detection=False,
                    detector_backend=detector,
                    silent=True
                )
                logger.info(f"✓ DeepFace analysis successful with {detector}")
                break
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"❌ DeepFace analysis failed with {detector}: {error_msg}")
                continue
        
        # Format response
        if result and len(result) > 0:
            # Handle both list and dict responses from DeepFace
            if isinstance(result, list):
                emotion_data = result[0]
            else:
                emotion_data = result
            
            # Convert emotion scores to native Python floats
            emotions_converted = {
                emotion: float(score) 
                for emotion, score in emotion_data['emotion'].items()
            }
            
            response = {
                "success": True,
                "dominant_emotion": str(emotion_data['dominant_emotion']),
                "emotions": emotions_converted,
                "faces": [
                    {
                        "x": int(x), 
                        "y": int(y), 
                        "width": int(w), 
                        "height": int(h)
                    } 
                    for (x, y, w, h) in faces
                ],
                "face_count": max(len(faces), 1)
            }
            
            logger.info(f"✅ Success! Emotion: {response['dominant_emotion']}")
            logger.info("="*60 + "\n")
            return jsonify(response)
        else:
            logger.error("❌ No emotion data extracted from any detector")
            logger.info("="*60 + "\n")
            return jsonify({
                "success": False,
                "error": f"Could not detect face or emotion. Last error: {error_msg}",
                "faces": [],
                "face_count": 0
            }), 200
    
    except Exception as e:
        logger.error(f"❌ Exception occurred: {str(e)}")
        logger.error(traceback.format_exc())
        logger.info("="*60 + "\n")
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/analyze-with-features', methods=['POST', 'OPTIONS'])
def analyze_with_features():
    """
    Analyze emotion, age, and gender from uploaded image
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode base64 image
        image_data = data['image']
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        image = Image.open(io.BytesIO(image_bytes))
        frame = np.array(image)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Analyze with multiple features
        result = DeepFace.analyze(
            frame, 
            actions=['emotion', 'age', 'gender'], 
            enforce_detection=False,
            detector_backend='opencv',
            silent=True
        )
        
        # Handle both list and dict responses
        if isinstance(result, list):
            result = result[0]
        
        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, 1.1, 4)
        
        # Convert emotion scores to native Python types
        emotions_converted = {
            emotion: float(score) 
            for emotion, score in result['emotion'].items()
        }
        
        response = {
            "success": True,
            "dominant_emotion": str(result['dominant_emotion']),
            "emotions": emotions_converted,
            "age": int(result.get('age', 0)) if result.get('age') else 'unknown',
            "gender": str(result.get('dominant_gender', 'unknown')),
            "faces": [
                {
                    "x": int(x), 
                    "y": int(y), 
                    "width": int(w), 
                    "height": int(h)
                } 
                for (x, y, w, h) in faces
            ],
            "face_count": len(faces)
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Emotion Detection API Server")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("\nEndpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/analyze-emotion - Analyze emotion from image")
    print("  POST /api/analyze-with-features - Analyze emotion, age, gender")
    print("=" * 60)
    print("\n📝 Detailed logging enabled - watch for analysis results\n")
    app.run(debug=True, port=5000, host='0.0.0.0')
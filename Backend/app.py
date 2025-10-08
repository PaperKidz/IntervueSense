from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from deepface import DeepFace
import base64
import numpy as np
from PIL import Image
import io
import traceback

app = Flask(__name__)
CORS(app)

# Initialize face cascade
faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({"status": "ok", "message": "Emotion Detection API is running"})

@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """
    Analyze emotion from uploaded image
    """
    try:
        print("\n" + "="*60)
        print("🔍 Received analysis request")
        
        # Get image data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            print("❌ No image in request")
            return jsonify({"error": "No image provided"}), 400
        
        print("✓ Image data received")
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        frame = np.array(image)
        
        print(f"✓ Image decoded: {frame.shape}")
        
        # Convert RGB to BGR for OpenCV
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Detect faces first
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        print(f"👤 Faces detected by Haar Cascade: {len(faces)}")
        
        # Try to analyze emotion with different settings
        result = None
        error_msg = None
        
        # Try with enforce_detection=False first
        try:
            print("Attempting DeepFace analysis (enforce_detection=False)...")
            result = DeepFace.analyze(
                frame, 
                actions=['emotion'], 
                enforce_detection=False,
                detector_backend='opencv'
            )
            print(f"✓ DeepFace analysis successful")
        except Exception as e:
            error_msg = str(e)
            print(f"❌ DeepFace analysis failed: {error_msg}")
            
            # If no face detected, try with different detector
            try:
                print("Retrying with different settings...")
                result = DeepFace.analyze(
                    frame, 
                    actions=['emotion'], 
                    enforce_detection=False,
                    detector_backend='retinaface'
                )
                print(f"✓ DeepFace analysis successful with retinaface")
            except Exception as e2:
                print(f"❌ Second attempt failed: {str(e2)}")
        
        # Format response
        if result and len(result) > 0:
            response = {
                "success": True,
                "dominant_emotion": result[0]['dominant_emotion'],
                "emotions": result[0]['emotion'],
                "faces": [{"x": int(x), "y": int(y), "width": int(w), "height": int(h)} 
                         for (x, y, w, h) in faces],
                "face_count": len(faces) if len(faces) > 0 else 1
            }
            print(f"✅ Success! Emotion: {response['dominant_emotion']}")
            print("="*60 + "\n")
            return jsonify(response)
        else:
            print("❌ No emotion data extracted")
            print("="*60 + "\n")
            return jsonify({
                "success": False,
                "error": f"Could not detect face or emotion. Error: {error_msg}",
                "faces": [],
                "face_count": 0
            }), 200
    
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        print(traceback.format_exc())
        print("="*60 + "\n")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analyze-with-features', methods=['POST'])
def analyze_with_features():
    """
    Analyze emotion, age, and gender from uploaded image
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        image = Image.open(io.BytesIO(image_bytes))
        frame = np.array(image)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Analyze with multiple features
        result = DeepFace.analyze(
            frame, 
            actions=['emotion', 'age', 'gender'], 
            enforce_detection=False,
            detector_backend='opencv'
        )
        
        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(gray, 1.1, 4)
        
        response = {
            "success": True,
            "dominant_emotion": result[0]['dominant_emotion'],
            "emotions": result[0]['emotion'],
            "age": result[0].get('age', 'unknown'),
            "gender": result[0].get('dominant_gender', 'unknown'),
            "faces": [{"x": int(x), "y": int(y), "width": int(w), "height": int(h)} 
                     for (x, y, w, h) in faces],
            "face_count": len(faces)
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
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
    app.run(debug=True, port=5000)
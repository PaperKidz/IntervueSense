import cv2
from deepface import DeepFace
import time
from collections import deque
import numpy as np

# ============================================================
# CONFIGURATION
# ============================================================
PROCESS_EVERY_N_FRAMES = 2  # Lower = more accurate, Higher = faster
SHOW_ALL_EMOTIONS = True    # Show emotion scores
SHOW_FPS = True             # Display FPS counter
SMOOTH_EMOTIONS = True      # Smooth emotion transitions
CAMERA_INDEX = 0            # Change if needed (0, 1, 2, etc.)
CONFIDENCE_THRESHOLD = 0    # Minimum confidence to display (0-100)

# ============================================================
# INITIALIZATION
# ============================================================
print("Initializing Emotion Detection System...")
print("=" * 60)

# Initialize face cascade classifier
faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Camera selection
def select_camera():
    print("\nDetecting available cameras...")
    available_cameras = []
    
    for i in range(5):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                available_cameras.append((i, width, height))
                print(f"  Camera {i}: Available ({width}x{height})")
            cap.release()
    
    if not available_cameras:
        raise IOError("No cameras found!")
    
    if len(available_cameras) == 1:
        selected = available_cameras[0][0]
        print(f"\nUsing Camera {selected}")
        return selected
    
    print(f"\nFound {len(available_cameras)} cameras.")
    print("Testing each camera... Press 'Y' to select, 'N' to skip")
    
    for cam_idx, width, height in available_cameras:
        cap = cv2.VideoCapture(cam_idx)
        ret, frame = cap.read()
        if ret:
            cv2.putText(frame, f"Camera {cam_idx} - Press Y to select, N to skip", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow('Camera Selection', frame)
            key = cv2.waitKey(0)
            cv2.destroyAllWindows()
            
            if key == ord('y') or key == ord('Y'):
                cap.release()
                print(f"Selected Camera {cam_idx}")
                return cam_idx
        cap.release()
    
    print(f"No camera selected, using Camera {available_cameras[0][0]}")
    return available_cameras[0][0]

# Select and open camera
camera_idx = select_camera()
cap = cv2.VideoCapture(camera_idx)

# Set camera properties for better quality
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)

if not cap.isOpened():
    raise IOError("Failed to open selected camera")

print("Camera opened successfully!")
print("\nControls:")
print("  Q - Quit")
print("  S - Save screenshot")
print("  R - Reset emotion history")
print("  T - Toggle all emotions display")
print("  F - Toggle FPS display")
print("=" * 60)

# ============================================================
# EMOTION SMOOTHING
# ============================================================
emotion_history = deque(maxlen=10)  # Store last 10 emotions for smoothing

def get_smoothed_emotion(current_emotion):
    """Smooth emotion transitions to reduce flickering"""
    if not SMOOTH_EMOTIONS:
        return current_emotion
    
    emotion_history.append(current_emotion)
    
    # Count occurrences
    emotion_counts = {}
    for emotion in emotion_history:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Return most common emotion
    return max(emotion_counts, key=emotion_counts.get)

# ============================================================
# EMOTION COLOR MAPPING
# ============================================================
emotion_colors = {
    'happy': (0, 255, 0),      # Green
    'sad': (255, 0, 0),        # Blue
    'angry': (0, 0, 255),      # Red
    'surprise': (0, 255, 255), # Yellow
    'fear': (128, 0, 128),     # Purple
    'disgust': (0, 128, 128),  # Teal
    'neutral': (200, 200, 200) # Gray
}

# ============================================================
# FPS CALCULATOR
# ============================================================
fps_history = deque(maxlen=30)
prev_time = time.time()

def calculate_fps():
    global prev_time
    current_time = time.time()
    fps = 1 / (current_time - prev_time)
    prev_time = current_time
    fps_history.append(fps)
    return np.mean(fps_history)

# ============================================================
# MAIN LOOP
# ============================================================
font = cv2.FONT_HERSHEY_SIMPLEX
frame_count = 0
dominant_emotion = "Detecting..."
all_emotions = {}
show_all = SHOW_ALL_EMOTIONS
show_fps_flag = SHOW_FPS
screenshot_count = 0

print("\n🎥 Starting emotion detection...\n")

while True:
    ret, frame = cap.read()
    
    if not ret:
        print("Failed to grab frame")
        break
    
    # Mirror the frame (more natural for webcam)
    frame = cv2.flip(frame, 1)
    
    # Analyze emotion periodically
    if frame_count % PROCESS_EVERY_N_FRAMES == 0:
        try:
            # Analyze emotion with DeepFace
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            
            if result and isinstance(result, list) and len(result) > 0:
                dominant_emotion = result[0]['dominant_emotion']
                all_emotions = result[0]['emotion']
                
                # Apply smoothing
                dominant_emotion = get_smoothed_emotion(dominant_emotion)
        
        except Exception as e:
            print(f"Error analyzing emotion: {e}")
            dominant_emotion = "Error"
    
    # Face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
    
    # Draw rectangles around faces with emotion-based color
    emotion_color = emotion_colors.get(dominant_emotion.lower(), (0, 255, 0))
    
    for (x, y, w, h) in faces:
        # Draw rectangle
        cv2.rectangle(frame, (x, y), (x + w, y + h), emotion_color, 3)
        
        # Draw emotion label near face
        label_y = y - 10 if y > 30 else y + h + 25
        cv2.putText(frame, dominant_emotion.upper(), 
                   (x, label_y), font, 0.9, emotion_color, 2)
    
    # ============================================================
    # DISPLAY INFORMATION OVERLAY
    # ============================================================
    overlay = frame.copy()
    
    # Semi-transparent background for text
    cv2.rectangle(overlay, (10, 10), (400, 220 if show_all else 80), (0, 0, 0), -1)
    frame = cv2.addWeighted(overlay, 0.6, frame, 0.4, 0)
    
    # Main emotion display
    cv2.putText(frame, f"Emotion: {dominant_emotion.upper()}", 
               (20, 45), font, 1.2, emotion_color, 2)
    
    # Show all emotion scores
    if show_all and all_emotions:
        y_pos = 80
        sorted_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
        
        for emotion, score in sorted_emotions:
            if score > CONFIDENCE_THRESHOLD:
                bar_length = int(score * 2)  # Scale for visualization
                color = emotion_colors.get(emotion.lower(), (255, 255, 255))
                
                # Emotion name and percentage
                text = f"{emotion.capitalize()}: {score:.1f}%"
                cv2.putText(frame, text, (20, y_pos), font, 0.5, (255, 255, 255), 1)
                
                # Progress bar
                cv2.rectangle(frame, (180, y_pos - 12), (180 + bar_length, y_pos - 2), color, -1)
                
                y_pos += 20
    
    # FPS Counter
    if show_fps_flag:
        fps = calculate_fps()
        cv2.putText(frame, f"FPS: {fps:.1f}", 
                   (frame.shape[1] - 150, 40), font, 0.7, (0, 255, 0), 2)
    
    # Face count
    cv2.putText(frame, f"Faces: {len(faces)}", 
               (frame.shape[1] - 150, 70), font, 0.6, (255, 255, 255), 1)
    
    # Show frame
    cv2.imshow('Enhanced Emotion Detection', frame)
    
    frame_count += 1
    
    # ============================================================
    # KEYBOARD CONTROLS
    # ============================================================
    key = cv2.waitKey(1) & 0xFF
    
    if key == ord('q'):
        print("\n👋 Quitting...")
        break
    elif key == ord('s'):
        # Save screenshot
        filename = f"emotion_capture_{screenshot_count}_{dominant_emotion}.jpg"
        cv2.imwrite(filename, frame)
        print(f"📸 Screenshot saved: {filename}")
        screenshot_count += 1
    elif key == ord('r'):
        # Reset emotion history
        emotion_history.clear()
        print("🔄 Emotion history reset")
    elif key == ord('t'):
        # Toggle all emotions display
        show_all = not show_all
        print(f"📊 All emotions: {'ON' if show_all else 'OFF'}")
    elif key == ord('f'):
        # Toggle FPS display
        show_fps_flag = not show_fps_flag
        print(f"⚡ FPS display: {'ON' if show_fps_flag else 'OFF'}")

# ============================================================
# CLEANUP
# ============================================================
cap.release()
cv2.destroyAllWindows()
print("\n✅ Emotion detection stopped.")
print(f"📊 Total frames processed: {frame_count}")
print(f"📸 Screenshots saved: {screenshot_count}")
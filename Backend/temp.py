import cv2
from deepface import DeepFace
import time
from collections import deque
import numpy as np

# ============================================================
# CONFIGURATION
# ============================================================
PROCESS_EVERY_N_FRAMES = 2
SHOW_ALL_EMOTIONS = True
SHOW_FPS = True
SMOOTH_EMOTIONS = True
CAMERA_INDEX = 0
CONFIDENCE_THRESHOLD = 0

# ============================================================
# INITIALIZATION
# ============================================================
print("Initializing Emotion Detection System...")
print("=" * 60)

faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Camera selection -------------------------------------------------------------
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
    selected = available_cameras[0][0]
    print(f"\nUsing Camera {selected}")
    return selected

camera_idx = select_camera()
cap = cv2.VideoCapture(camera_idx)
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
emotion_history = deque(maxlen=10)
def get_smoothed_emotion(current_emotion):
    if not SMOOTH_EMOTIONS:
        return current_emotion
    emotion_history.append(current_emotion)
    emotion_counts = {}
    for emotion in emotion_history:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    return max(emotion_counts, key=emotion_counts.get)

# ============================================================
# COLOR MAP
# ============================================================
emotion_colors = {
    'happy': (0, 255, 0),
    'sad': (255, 0, 0),
    'angry': (0, 0, 255),
    'surprise': (0, 255, 255),
    'fear': (128, 0, 128),
    'disgust': (0, 128, 128),
    'neutral': (200, 200, 200)
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

# Initialize histories
confidence_history = deque(maxlen=30)
nervousness_history = deque(maxlen=30)

print("\n🎥 Starting emotion detection...\n")

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame")
        break
    frame = cv2.flip(frame, 1)

    # Analyze emotions
    if frame_count % PROCESS_EVERY_N_FRAMES == 0:
        try:
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            if result and isinstance(result, list) and len(result) > 0:
                dominant_emotion = result[0]['dominant_emotion']
                all_emotions = result[0]['emotion']
                dominant_emotion = get_smoothed_emotion(dominant_emotion)

                # === Confidence/Nervousness Calculation ===
                happy = all_emotions.get('happy', 0)
                neutral = all_emotions.get('neutral', 0)
                fear = all_emotions.get('fear', 0)
                sad = all_emotions.get('sad', 0)
                angry = all_emotions.get('angry', 0)
                disgust = all_emotions.get('disgust', 0)
                surprise = all_emotions.get('surprise', 0)

                positive = happy + neutral
                negative = fear + sad + angry + disgust

                confidence = positive - (negative * 0.5 + surprise * 0.3)
                nervousness = (negative * 0.6 + surprise * 0.4)
                confidence = np.clip(confidence, 0, 100)
                nervousness = np.clip(nervousness, 0, 100)

                confidence_history.append(confidence)
                nervousness_history.append(nervousness)
                smoothed_confidence = np.mean(confidence_history)
                smoothed_nervousness = np.mean(nervousness_history)

        except Exception as e:
            print(f"Error analyzing emotion: {e}")
            dominant_emotion = "Error"

    # Face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
    emotion_color = emotion_colors.get(dominant_emotion.lower(), (0, 255, 0))

    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x + w, y + h), emotion_color, 3)
        label_y = y - 10 if y > 30 else y + h + 25
        cv2.putText(frame, dominant_emotion.upper(), (x, label_y), font, 0.9, emotion_color, 2)

    # ============================================================
    # DISPLAY INFORMATION
    # ============================================================
    overlay = frame.copy()
    cv2.rectangle(overlay, (10, 10), (400, 220 if show_all else 80), (0, 0, 0), -1)
    frame = cv2.addWeighted(overlay, 0.6, frame, 0.4, 0)
    cv2.putText(frame, f"Emotion: {dominant_emotion.upper()}", (20, 45), font, 1.2, emotion_color, 2)

    if show_all and all_emotions:
        y_pos = 80
        sorted_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
        for emotion, score in sorted_emotions:
            if score > CONFIDENCE_THRESHOLD:
                bar_length = int(score * 2)
                color = emotion_colors.get(emotion.lower(), (255, 255, 255))
                text = f"{emotion.capitalize()}: {score:.1f}%"
                cv2.putText(frame, text, (20, y_pos), font, 0.5, (255, 255, 255), 1)
                cv2.rectangle(frame, (180, y_pos - 12), (180 + bar_length, y_pos - 2), color, -1)
                y_pos += 20

    if show_fps_flag:
        fps = calculate_fps()
        cv2.putText(frame, f"FPS: {fps:.1f}", (frame.shape[1] - 150, 40), font, 0.7, (0, 255, 0), 2)

    cv2.putText(frame, f"Faces: {len(faces)}", (frame.shape[1] - 150, 70), font, 0.6, (255, 255, 255), 1)

    # === Confidence/Nervousness overlay ===
    if len(confidence_history) > 0:
        cv2.putText(frame, f"Confidence: {np.mean(confidence_history):.1f}%", 
                    (20, frame.shape[0]-60), font, 0.7, (0,255,0), 2)
        cv2.putText(frame, f"Nervousness: {np.mean(nervousness_history):.1f}%", 
                    (20, frame.shape[0]-30), font, 0.7, (0,0,255), 2)

        # Progress bars
        conf_bar = int(np.mean(confidence_history)*2)
        nerv_bar = int(np.mean(nervousness_history)*2)
        cv2.rectangle(frame, (250, frame.shape[0]-75), (250+conf_bar, frame.shape[0]-60), (0,255,0), -1)
        cv2.rectangle(frame, (250, frame.shape[0]-45), (250+nerv_bar, frame.shape[0]-30), (0,0,255), -1)

    # ============================================================
    # SHOW FRAME
    # ============================================================
    cv2.imshow('Interview Confidence/Nervousness Detector', frame)
    frame_count += 1

    # ============================================================
    # KEYBOARD CONTROLS
    # ============================================================
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        print("\n👋 Quitting...")
        break
    elif key == ord('s'):
        filename = f"emotion_capture_{screenshot_count}_{dominant_emotion}.jpg"
        cv2.imwrite(filename, frame)
        print(f"📸 Screenshot saved: {filename}")
        screenshot_count += 1
    elif key == ord('r'):
        emotion_history.clear()
        confidence_history.clear()
        nervousness_history.clear()
        print("🔄 Emotion & confidence history reset")
    elif key == ord('t'):
        show_all = not show_all
        print(f"📊 All emotions: {'ON' if show_all else 'OFF'}")
    elif key == ord('f'):
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

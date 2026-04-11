import cv2
import mediapipe as mp
import numpy as np

# MediaPipe Setup
mp_face_mesh = mp.solutions.face_mesh

# Iris landmarks indexes (MediaPipe)
LEFT_IRIS = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]

# Eye boundary landmarks (approx)
LEFT_EYE = [33, 133]
RIGHT_EYE = [362, 263]

def euclidean_distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def main():
    print("Starting Live Eye Tracking (Press 'q' or Esc to exit)...")
    # Initialize the webcam (0 is the default camera)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # FaceMesh Setup
    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        refine_landmarks=True,
        max_num_faces=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as face_mesh:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to read from webcam.")
                break

            # Mirror image
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            h, w, _ = frame.shape

            results = face_mesh.process(rgb_frame)

            confidence = 0
            status = "Face Not Detected"
            color = (255, 0, 0)

            if results.multi_face_landmarks:
                mesh_points = np.array(
                    [(int(p.x * w), int(p.y * h)) for p in results.multi_face_landmarks[0].landmark]
                )

                # LEFT EYE
                left_iris_center = np.mean(mesh_points[LEFT_IRIS], axis=0).astype(int)
                left_eye_left = mesh_points[LEFT_EYE[0]]
                left_eye_right = mesh_points[LEFT_EYE[1]]

                # RIGHT EYE
                right_iris_center = np.mean(mesh_points[RIGHT_IRIS], axis=0).astype(int)
                right_eye_left = mesh_points[RIGHT_EYE[0]]
                right_eye_right = mesh_points[RIGHT_EYE[1]]

                # Draw iris centers
                cv2.circle(frame, tuple(left_iris_center), 3, (0, 255, 0), -1)
                cv2.circle(frame, tuple(right_iris_center), 3, (0, 255, 0), -1)

                # Eye midpoints
                left_eye_mid = ((left_eye_left + left_eye_right) / 2).astype(int)
                right_eye_mid = ((right_eye_left + right_eye_right) / 2).astype(int)

                # Distances
                left_dist = euclidean_distance(left_iris_center, left_eye_mid)
                right_dist = euclidean_distance(right_iris_center, right_eye_mid)

                # Eye width
                left_eye_width = euclidean_distance(left_eye_left, left_eye_right)
                right_eye_width = euclidean_distance(right_eye_left, right_eye_right)

                # Normalized gaze score
                left_score = left_dist / left_eye_width
                right_score = right_dist / right_eye_width

                gaze_score = (left_score + right_score) / 2

                # Confidence
                confidence = max(0, 100 - (gaze_score * 300))

                # Status
                if confidence > 70:
                    status = "Focused on Interviewer"
                    color = (0, 255, 0)
                elif confidence > 40:
                    status = "Partially Focused"
                    color = (0, 255, 255)
                else:
                    status = "Not Focused"
                    color = (0, 0, 255)

                # Display text
                cv2.putText(frame, f"Status: {status}", (30, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                cv2.putText(frame, f"Confidence: {confidence:.2f}%", (30, 100),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

            # Show the frame in a window instead of matplotlib inline plotting
            cv2.imshow("Live Eye Tracking", frame)

            # Exit condition
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27: # 'q' or Esc
                break
                
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

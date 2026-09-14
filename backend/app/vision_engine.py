import cv2
import numpy as np
from PIL import Image
import io

def analyze_dom_snapshot(image_bytes: bytes) -> dict:
    """Analyzes a website snapshot image for visual anomaly/phishing indicators."""
    image = Image.open(io.BytesIO(image_bytes))
    img_np = np.array(image)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1=100, threshold2=200)
    edge_density = float(np.sum(edges > 0) / (edges.shape[0] * edges.shape[1]))

    hist_b = cv2.calcHist([img_bgr], [0], None, [256], [0, 256])
    dominant_color_spread = float(np.std(hist_b))

    cv_confidence_index = round(min(0.99, max(0.50, 1.0 - (edge_density * 2))), 2)
    is_suspicious_overlay = edge_density < 0.02 or dominant_color_spread > 5000

    return {
        "cv_confidence_index": cv_confidence_index,
        "is_suspicious_overlay": is_suspicious_overlay,
        "edge_density": round(edge_density, 4),
        "visual_threat_detected": is_suspicious_overlay
    }

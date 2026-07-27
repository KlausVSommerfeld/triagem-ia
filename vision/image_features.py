from dataclasses import dataclass
from PIL import Image
import colorsys


@dataclass
class ImageFeatures:
    avg_brightness: float
    avg_saturation: float
    has_face: bool
    # Reconhecimento facial de EMOÇÃO deliberadamente omitido: a evidência
    # científica (Barrett et al., 2019) não sustenta mapeamento confiável
    # de expressão facial para estado emocional interno.


def extract_image_features(image_path: str, face_detector=None) -> ImageFeatures:
    img = Image.open(image_path).convert("RGB")
    pixels = list(img.getdata())
    n = len(pixels)

    brightness_sum = 0.0
    saturation_sum = 0.0
    for r, g, b in pixels:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        brightness_sum += v
        saturation_sum += s

    has_face = face_detector(img) if face_detector else False

    return ImageFeatures(
        avg_brightness=brightness_sum / n,
        avg_saturation=saturation_sum / n,
        has_face=has_face,
    )

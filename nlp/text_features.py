from dataclasses import dataclass
from typing import Optional

# LIWC não é open-source (licença paga). Alternativas abertas: NRC Emotion
# Lexicon, ou treinar léxico próprio validado — não confirmado qual usar
# sem definição de budget e revisão por profissional de saúde mental.


@dataclass
class TextRiskSignal:
    negative_affect_ratio: float
    first_person_singular_ratio: float
    absolutist_words_ratio: float  # correlacionado com ideação em estudos (não causal)
    embedding_risk_score: float     # saída de classificador calibrado, 0-1
    confidence: float               # nunca tratar como probabilidade de diagnóstico


class TextFeatureExtractor:
    def __init__(self, lexicon_path: str, classifier_path: Optional[str] = None):
        self.lexicon = self._load_lexicon(lexicon_path)
        self.classifier = self._load_classifier(classifier_path) if classifier_path else None

    def _load_lexicon(self, path: str) -> dict:
        raise NotImplementedError("Definir fonte do léxico antes de produção")

    def _load_classifier(self, path: str):
        raise NotImplementedError("Classificador precisa ser treinado e validado clinicamente")

    def extract(self, text: str) -> TextRiskSignal:
        tokens = text.lower().split()
        total = max(len(tokens), 1)

        neg = sum(1 for t in tokens if t in self.lexicon.get("negative", set()))
        first_person = sum(1 for t in tokens if t in {"eu", "me", "mim", "meu", "minha"})
        absolutist = sum(1 for t in tokens if t in self.lexicon.get("absolutist", set()))

        return TextRiskSignal(
            negative_affect_ratio=neg / total,
            first_person_singular_ratio=first_person / total,
            absolutist_words_ratio=absolutist / total,
            embedding_risk_score=0.0,  # placeholder até classificador validado existir
            confidence=0.0,
        )

from dataclasses import dataclass
from nlp.text_features import TextRiskSignal
from vision.image_features import ImageFeatures

# Domínios de triagem suportados. Cada um referencia o instrumento clínico
# validado correspondente — o score NUNCA deve ser apresentado como
# diagnóstico, e subtipos que não têm sinal digital estabelecido na
# literatura (ex.: transtorno bipolar tipo 1 vs. tipo 2) não são
# diferenciados por este sistema.
SCREENING_DOMAINS = {
    "depressao": {"label": "Depressão", "instrument": "referência PHQ-9"},
    "ansiedade": {"label": "Ansiedade", "instrument": "referência GAD-7"},
    "bipolar": {
        "label": "Espectro bipolar (triagem)",
        "instrument": "referência MDQ — não diferencia subtipo",
    },
}


@dataclass
class RiskReport:
    domain: str
    score: float               # 0-1, sinal agregado — NUNCA rotular como "diagnóstico"
    confidence: str             # "baixa" | "média" | "alta" — sempre conservador
    contributing_signals: list[str]
    requires_clinician_review: bool = True  # sempre True; não é configurável


def aggregate(
    domain: str,
    text_signals: list[TextRiskSignal],
    image_signals: list[ImageFeatures],
) -> RiskReport:
    if domain not in SCREENING_DOMAINS:
        raise ValueError(
            f"Domínio de triagem desconhecido: {domain}. "
            f"Domínios suportados: {list(SCREENING_DOMAINS)}"
        )

    if not text_signals:
        return RiskReport(domain=domain, score=0.0, confidence="baixa", contributing_signals=[])

    avg_negative = sum(s.negative_affect_ratio for s in text_signals) / len(text_signals)
    avg_absolutist = sum(s.absolutist_words_ratio for s in text_signals) / len(text_signals)

    # NÃO CONFIRMADO: pesos ilustrativos. Precisam de calibração com dados
    # clínicos reais e supervisão de um psicólogo/psiquiatra por domínio
    # antes de qualquer uso com pacientes reais. Hoje o mesmo peso é usado
    # para todos os domínios, o que é uma simplificação inaceitável para
    # produção — cada domínio precisa do seu próprio conjunto de features
    # e pesos (ver README, seção "Limitações").
    score = min(1.0, 0.6 * avg_negative + 0.4 * avg_absolutist)

    contributing = []
    if avg_negative > 0.15:
        contributing.append("aumento de afeto negativo em texto")
    if avg_absolutist > 0.05:
        contributing.append("aumento de linguagem absolutista")

    confidence = "baixa" if len(text_signals) < 10 else "média"

    return RiskReport(
        domain=domain,
        score=score,
        confidence=confidence,
        contributing_signals=contributing,
    )

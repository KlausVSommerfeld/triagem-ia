import pytest
from risk.aggregator import aggregate, SCREENING_DOMAINS
from nlp.text_features import TextRiskSignal


def _signal(negative=0.0, absolutist=0.0):
    return TextRiskSignal(
        negative_affect_ratio=negative,
        first_person_singular_ratio=0.0,
        absolutist_words_ratio=absolutist,
        embedding_risk_score=0.0,
        confidence=0.0,
    )


def test_unknown_domain_raises():
    with pytest.raises(ValueError):
        aggregate("transtorno_bipolar_tipo_1", [_signal()], [])


def test_empty_signals_returns_zero_score():
    report = aggregate("depressao", [], [])
    assert report.score == 0.0
    assert report.requires_clinician_review is True


def test_high_negative_affect_raises_score():
    report = aggregate("depressao", [_signal(negative=0.5, absolutist=0.2)], [])
    assert report.score > 0.0
    assert "aumento de afeto negativo em texto" in report.contributing_signals


def test_all_domains_have_instrument_reference():
    for domain, info in SCREENING_DOMAINS.items():
        assert "instrument" in info
        assert "label" in info

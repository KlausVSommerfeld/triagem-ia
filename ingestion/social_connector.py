"""
Conector de ingestão de redes sociais.

PRINCÍPIO DE DESIGN: só existe leitura de dados que o próprio paciente
autorizou via fluxo OAuth da plataforma (Meta, etc). Este módulo nunca
deve implementar scraping, raspagem de HTML, ou chamadas a endpoints
não documentados — ver conversa sobre OAuth vs. scraping no histórico
do projeto.

NÃO CONFIRMADO: os escopos exatos de OAuth e os endpoints de API mudam
por plataforma e por versão. Antes de implementar de verdade, validar
contra a documentação oficial de cada provedor (ex.: Graph API da Meta)
e o app review process de cada um — a maioria exige aprovação manual
para escopos de dados de saúde/sensíveis.
"""

from dataclasses import dataclass
from consent.consent_service import ConsentService, DataScope


@dataclass
class OAuthToken:
    patient_id: str
    provider: str          # ex.: "meta", "instagram"
    access_token: str
    scopes: list[str]
    expires_at: str         # ISO 8601


class SocialConnector:
    def __init__(self, consent_service: ConsentService):
        self.consent_service = consent_service

    def fetch_posts(self, patient_id: str, token: OAuthToken) -> list[dict]:
        if not self.consent_service.check(patient_id, DataScope.SOCIAL_TEXT):
            raise PermissionError(
                f"Consentimento ausente ou expirado para social_text: {patient_id}"
            )
        # NÃO CONFIRMADO: chamada real à API do provedor precisa ser
        # implementada e validada contra a documentação oficial.
        raise NotImplementedError(
            "Integração com API do provedor ainda não implementada — "
            "requer validação de endpoints e escopos por plataforma."
        )

    def fetch_images(self, patient_id: str, token: OAuthToken) -> list[dict]:
        if not self.consent_service.check(patient_id, DataScope.SOCIAL_IMAGES):
            raise PermissionError(
                f"Consentimento ausente ou expirado para social_images: {patient_id}"
            )
        raise NotImplementedError(
            "Integração com API do provedor ainda não implementada — "
            "requer validação de endpoints e escopos por plataforma."
        )

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional


class DataScope(str, Enum):
    TEXT_CONVERSATIONS = "text_conversations"
    SOCIAL_TEXT = "social_text"
    SOCIAL_IMAGES = "social_images"


@dataclass
class ConsentRecord:
    patient_id: str
    scopes: set[DataScope]
    granted_at: datetime
    expires_at: datetime
    revoked_at: Optional[datetime] = None

    def is_active(self, scope: DataScope) -> bool:
        now = datetime.utcnow()
        return (
            scope in self.scopes
            and self.revoked_at is None
            and now < self.expires_at
        )


class ConsentService:
    """Fonte única de verdade sobre o que pode ser acessado.
    Nenhum outro módulo deve ler dados sem consultar isto primeiro.
    """

    def __init__(self):
        self._records: dict[str, ConsentRecord] = {}

    def grant(
        self, patient_id: str, scopes: set[DataScope], validity_days: int = 90
    ) -> ConsentRecord:
        record = ConsentRecord(
            patient_id=patient_id,
            scopes=scopes,
            granted_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=validity_days),
        )
        self._records[patient_id] = record
        return record

    def revoke(self, patient_id: str) -> None:
        if patient_id in self._records:
            self._records[patient_id].revoked_at = datetime.utcnow()
            # Em produção: disparar job de exclusão dos dados já coletados

    def check(self, patient_id: str, scope: DataScope) -> bool:
        record = self._records.get(patient_id)
        return record is not None and record.is_active(scope)

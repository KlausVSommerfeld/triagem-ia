from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AuditEntry:
    actor: str           # quem acessou (clínico, sistema)
    patient_id: str
    action: str           # "read_text", "compute_risk", "view_report", "view_identity"
    timestamp: datetime = field(default_factory=datetime.utcnow)


class AuditLog:
    """Append-only por design. Nunca expor método de delete/update.

    Nota: acessar a identidade do paciente (nome) junto com o score de
    risco é um nível de acesso diferente de acessar só o score — ver
    discussão no README sobre re-identificação no ponto de uso. Registrar
    ações como "view_identity" separadamente de "compute_risk".
    """

    def __init__(self):
        self._entries: list[AuditEntry] = []

    def record(self, entry: AuditEntry) -> None:
        self._entries.append(entry)

    def history_for(self, patient_id: str) -> list[AuditEntry]:
        return [e for e in self._entries if e.patient_id == patient_id]

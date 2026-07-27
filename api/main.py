from fastapi import FastAPI, HTTPException
from consent.consent_service import ConsentService, DataScope
from audit.audit_log import AuditLog, AuditEntry

app = FastAPI(title="Triagem IA - API interna (uso clínico supervisionado)")
consent_service = ConsentService()
audit_log = AuditLog()


@app.post("/patients/{patient_id}/risk-report")
def get_risk_report(patient_id: str, clinician_id: str, domain: str):
    if not consent_service.check(patient_id, DataScope.TEXT_CONVERSATIONS):
        raise HTTPException(403, "Consentimento ausente ou expirado para este escopo")

    audit_log.record(
        AuditEntry(actor=clinician_id, patient_id=patient_id, action=f"compute_risk:{domain}")
    )

    # Pipeline real: buscar dados -> extrair features -> aggregate(domain, ...) -> retornar
    # SEMPRE com requires_clinician_review=True e sem enviar nada ao paciente diretamente
    return {"message": "Relatório disponível apenas na fila de revisão clínica"}

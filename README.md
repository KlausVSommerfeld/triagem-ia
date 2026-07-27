# Triagem IA

Protótipo de arquitetura para triagem psicológica assistida por IA, combinando
análise de conversas terapeuta-paciente e conteúdo de redes sociais **autorizado
explicitamente pelo paciente**. Desenhado como ferramenta de apoio à decisão
clínica com revisão humana obrigatória — nunca como diagnóstico autônomo.

## Status

Protótipo de arquitetura, não pronto para uso com pacientes reais. Vários
componentes têm `NotImplementedError` propositalmente, marcando decisões que
exigem validação clínica, jurídica ou de produto antes de seguir.

## Princípios de design

- **Consentimento explícito via OAuth, nunca scraping.** Todo dado de rede
  social só é acessado se o paciente autorizou via fluxo OAuth da própria
  plataforma. Ver `ingestion/social_connector.py`.
- **Revisão clínica obrigatória.** `RiskReport.requires_clinician_review` é
  sempre `True` e não é configurável. Nenhuma sinalização chega ao paciente
  sem um profissional revisar.
- **Domínio de triagem, não diagnóstico.** O sistema não tenta diferenciar
  subtipos clínicos sem sinal digital validado na literatura (ex.:
  transtorno bipolar tipo 1 vs. tipo 2 — ver `risk/aggregator.py`). Cada
  score é vinculado a um instrumento de triagem validado (PHQ-9, GAD-7,
  MDQ), atribuído pelo clínico, nunca inferido pela IA.
- **Auditoria append-only.** Todo acesso a dados de um paciente é
  registrado; ver `audit/audit_log.py`.

## Estrutura

```
consent/     — porta única de entrada para verificação de consentimento
ingestion/   — conectores OAuth (stub — requer validação por plataforma)
nlp/         — extração de features textuais
vision/      — extração de features de imagem (sem reconhecimento facial de emoção)
risk/        — agregação de sinais em score por domínio de triagem
audit/       — log de auditoria
api/         — API interna FastAPI
dashboard/   — painel de revisão clínica (React/artifact)
tests/       — testes automatizados
```

## Como rodar

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn api.main:app --reload --port 8000
```

Variáveis de ambiente necessárias (nunca hardcode):

```
DATABASE_URL=
SOCIAL_OAUTH_CLIENT_ID=
SOCIAL_OAUTH_CLIENT_SECRET=
ENCRYPTION_KEY=
```

## Testes

```bash
pytest tests/ -v
```

## Limitações conhecidas (não resolvidas neste protótipo)

- Pesos do `risk/aggregator.py` são placeholders sem validação clínica —
  o mesmo conjunto de pesos é usado para todos os domínios, o que precisa
  mudar antes de qualquer uso real (cada domínio precisa de features e
  pesos próprios, calibrados com apoio de psicólogo/psiquiatra).
- `ingestion/social_connector.py` não tem integração real com nenhuma
  plataforma — os endpoints e escopos de OAuth por provedor precisam ser
  validados contra a documentação oficial de cada um.
- `audit/audit_log.py` não distingue ainda acesso ao score de acesso à
  identidade do paciente (nome) — são níveis de sensibilidade diferentes.
- Sem autenticação real de clínico na API.
- Legislação relevante (LGPD, Art. 11 para dados de saúde) e posições de
  conselhos profissionais (CFM, CFP) sobre uso de IA em saúde mental devem
  ser revisadas com apoio jurídico antes de qualquer uso com pacientes
  reais.

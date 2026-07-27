from consent.consent_service import ConsentService, DataScope


def test_access_denied_without_consent():
    svc = ConsentService()
    assert not svc.check("patient_1", DataScope.TEXT_CONVERSATIONS)


def test_access_granted_within_validity():
    svc = ConsentService()
    svc.grant("patient_1", {DataScope.TEXT_CONVERSATIONS})
    assert svc.check("patient_1", DataScope.TEXT_CONVERSATIONS)


def test_revoke_blocks_access_immediately():
    svc = ConsentService()
    svc.grant("patient_1", {DataScope.SOCIAL_IMAGES})
    svc.revoke("patient_1")
    assert not svc.check("patient_1", DataScope.SOCIAL_IMAGES)

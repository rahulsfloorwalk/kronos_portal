from kronos.settings import REFERRAL_AUDIT_AMOUNT, REFERRAL_SIGNUP_AMOUNT, MAX_AUDIT_REFERRALS
from referral.models import AuditorReferral

def find_by_referred_by(user_id):
    return AuditorReferral.objects.filter(referred_by=user_id)

def find_signup_referred_by(user_id):
    return AuditorReferral.objects.filter(referred_by=user_id, type=AuditorReferral.SIGNUP)

def find_audit_referred_by(user_id):
    return AuditorReferral.objects.filter(referred_by=user_id, type=AuditorReferral.AUDIT)

def add_signup_referred_by(referred_by, referred_to):
    auditor_referral = AuditorReferral()
    auditor_referral.referred_by = referred_by
    auditor_referral.referred_to = referred_to
    auditor_referral.type = AuditorReferral.SIGNUP
    auditor_referral.amount = REFERRAL_SIGNUP_AMOUNT
    auditor_referral.comment = "Referral amount added to FloorWalk account"
    auditor_referral.save()
    return auditor_referral

def add_audit_referred_by(referred_by, referred_to):
    audit_referrals = find_audit_referred_by(referred_by)
    if(len(audit_referrals) <= MAX_AUDIT_REFERRALS):
        auditor_referral = AuditorReferral()
        auditor_referral.referred_by = referred_by
        auditor_referral.referred_to = referred_to
        auditor_referral.type = AuditorReferral.AUDIT
        auditor_referral.amount = REFERRAL_AUDIT_AMOUNT
        auditor_referral.comment = "Referral amount added to FloorWalk account"
        auditor_referral.save()
        return auditor_referral
    else:
        # Dont Add. Show message
        pass

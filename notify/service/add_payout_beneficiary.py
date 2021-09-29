import logging

from django.conf import settings
from django.contrib.auth.models import User

from registration.models import GROUP_NAME_AUDITOR
from auditor.models import ProfileInfo, BankInfo

from cashfree_sdk.payouts import Payouts
from cashfree_sdk.payouts.beneficiary import Beneficiary

from kronos.celery import app
from celery.result import ResultSet

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def add_beneficiary():

    auditor_list = User.objects.select_related('bankinfo', 'profileinfo') \
        .filter(groups__name=GROUP_NAME_AUDITOR, is_active = True, bankinfo__beneficiary_checked = False, bankinfo__account_holder_name__isnull = False, bankinfo__account_number__isnull = False,
                bankinfo__ifsc_code__isnull = False, profileinfo__address__isnull = False, profileinfo__mobile_number__isnull = False)[:500]

    async_results = ResultSet([])
    for auditor in auditor_list:
        async_results.add(add_beneficiary_task.delay(auditor))

    _logger.info("Today Beneficiary count is %s", len(async_results))
    return True


@app.task()
def add_beneficiary_task(auditor):
    _logger.info("Beneficiary creation for auditor id %s", auditor.id)

    try:
        beneId = auditor.bankinfo.beneficiary_id
        name = auditor.bankinfo.account_holder_name
        email = auditor.email
        phone = auditor.profileinfo.mobile_number
        address1 = auditor.profileinfo.address
        bankAccount = auditor.bankinfo.account_number
        ifsc = auditor.bankinfo.ifsc_code
    except ProfileInfo.DoesNotExist as pe:
        _logger.warn("(Beneficiary) Profile info for auditor id %s not found",auditor.id)
        return False

    except BankInfo.DoesNotExist as be:
        _logger.warn("(Beneficiary) Bank info for auditor id %s not found",auditor.id)
        return False

    try:
        Payouts.init(settings.PAYOUT_CLIENT_ID, settings.PAYOUT_CLIENT_SECRET, settings.PAYOUTENV)
        beneficiary = Beneficiary.add(beneId=beneId, name=name, email=email, phone=phone, address1=address1, bankAccount=bankAccount, ifsc=ifsc)
        response = beneficiary.json()
        if response.get('status', '') == 'SUCCESS' and response.get('subCode', '') == '200':
            _logger.info("Beneficiary created for auditor id %s",auditor.id)
            bank_info = auditor.bankinfo
            bank_info.beneficiary_checked = True
            bank_info.save()
            return True
        else:
            _logger.warn("Beneficiary not created for auditor id %s", response)
            return False
    except Exception as e:
        _logger.warn("Beneficiary creation error for auditor %s = %s", auditor.id, e)
        return False
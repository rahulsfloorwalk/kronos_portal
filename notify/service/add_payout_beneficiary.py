import logging

from django.conf import settings
from django.contrib.auth.models import User

from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_AUDITOR
from payment.service.payment_beneficiary import get_bank_details_for_beneficiary, get_beneficiary_id_for_user

from cashfree_sdk.payouts import Payouts
from cashfree_sdk.payouts.beneficiary import Beneficiary
from cashfree_sdk.exceptions.exceptions import AlreadyExistError

from kronos.celery import app
from celery.result import ResultSet

_logger = logging.getLogger(__name__)


@app.task(ignore_result=True)
def add_beneficiary():

    user_list = User.objects.filter(groups__name__in=[GROUP_NAME_AUDITOR, GROUP_NAME_AGENCY], is_active = True)[:500]

    async_results = ResultSet([])
    for user in user_list:
        try:
            if user.groups.filter(name = GROUP_NAME_AUDITOR).exists():
                if not user.bankinfo.is_payable():
                    continue
            elif user.groups.filter(name = GROUP_NAME_AGENCY).exists():
                if not user.agencyuser.agency.is_bank_details_complete():
                    continue
        except Exception as e:
            continue
        data = get_bank_details_for_beneficiary(user)
        async_results.add(add_beneficiary_task.delay(data))

    _logger.info("Today Beneficiary count is %s", len(async_results))
    return True


@app.task()
def add_beneficiary_task(user):
    email = user.get('email', None)
    phone = user.get('phone', None)
    address1 = user.get('address1') if user.get('address1') else settings.PAYOUT_DEFAULT_ADDRESS
    name = user.get('name', None)
    bankAccount = user.get('bankAccount', None)
    ifsc = user.get('ifsc', None)
    beneId = user.get('beneId', None)
    user_id = user.get('user_id', None)

    if not beneId or not name or not email or not phone or not address1 or not bankAccount or not ifsc:
        _logger.warn("Invalid beneficiary details for user id %s",user_id)
        return False
    try:
        Payouts.init(settings.PAYOUT_CLIENT_ID, settings.PAYOUT_CLIENT_SECRET, settings.PAYOUTENV)
        beneficiary = Beneficiary.add(beneId=beneId, name=name, email=email, phone=phone, address1=address1, bankAccount=bankAccount, ifsc=ifsc)
        response = beneficiary.json()
        if response.get('status', '') == 'SUCCESS' and response.get('subCode', '') == '200':
            _logger.info("Beneficiary created for user id %s",user_id)
            bene_info = get_beneficiary_id_for_user(user_id)
            if bene_info.beneficiary_id == beneId:
                bene_info.beneficiary_checked = True
                bene_info.save()
                return True
            return False
        else:
            _logger.warn("Beneficiary not created for user id %s %s", user_id, response)
            return False
    except AlreadyExistError as e:
        _logger.warn("Beneficiary id %s already exists", beneId)
        return False
    except Exception as e:
        _logger.warn("Beneficiary creation error for user %s = %s", user_id, e)
        return False
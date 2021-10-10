
import logging

from django.conf import settings
from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_AGENCY, GROUP_NAME_AUDITOR

from payment.models import Beneficiary
from auditor.models import ProfileInfo, BankInfo
from agency.models import Agency

from auditor.service import bank_info_service as bank_service

from cashfree_sdk.payouts import Payouts
from cashfree_sdk.payouts.beneficiary import Beneficiary as PayoutBeneficiary
from cashfree_sdk.exceptions.exceptions import BadRequestError, EntityDoesntExistError, AlreadyExistError, IncorrectCredsError


_logger = logging.getLogger(__name__)


def get_beneficiary_id_for_user(user_id):
    try:
        return Beneficiary.objects.get(user = user_id)
    except Beneficiary.DoesNotExist as e:
        raise ObjectNotFound from e


def create_beneficiary_id_for_user(user):
    beneficiary_id = "FLOORWALKBEN00{}".format(user.id)
    beneficiary_info = Beneficiary.objects.create(user = user, beneficiary_id = beneficiary_id)
    return beneficiary_info


def get_bank_details_for_beneficiary(user):
    default_address = settings.PAYOUT_DEFAULT_ADDRESS
    bene_details = get_beneficiary_id_for_user(user.id)
    if user.groups.filter(name=GROUP_NAME_AUDITOR).exists():
        bank = bank_service.find_bank_info_by_user_id(user.id)
        if bank:
            data = None
            try:
                data = {
                    'user_id': user.id,
                    'user_group': GROUP_NAME_AUDITOR,
                    'email': user.email,
                    'phone': user.profileinfo.mobile_number,
                    'address1': user.profileinfo.address if user.profileinfo.address else default_address,
                    'name': user.bankinfo.account_holder_name,
                    'bankAccount': user.bankinfo.account_number,
                    'ifsc': user.bankinfo.ifsc_code,
                    'beneId': bene_details.beneficiary_id,
                }
            except ProfileInfo.DoesNotExist as pe:
                raise AppLogicError("Please complete your personal information")
            except BankInfo.DoesNotExist as be:
                raise AppLogicError("Please complete your bank information")
            return data
        else:
            return None
    elif user.groups.filter(name=GROUP_NAME_AGENCY).exists():
        agency = user.agencyuser.agency
        if agency:
            data = None
            mobile_number_list = user.mobile_numbers.values_list('mobile_number', flat=True)
            try:
                data = {
                    'user_id': user.id,
                    'user_group': GROUP_NAME_AGENCY,
                    'email': user.email,
                    'phone': mobile_number_list[0] if mobile_number_list else "",
                    'address1': default_address,
                    'name': agency.account_holder_name,
                    'ifsc': agency.ifsc_code.upper(),
                    'bankAccount': agency.account_number,
                    'beneId': bene_details.beneficiary_id,
                }
            except Agency.DoesNotExist as pe:
                raise AppLogicError("Please complete your agency information")
            return data
        else:
            return None

def validate_beneficiary(user):
    if settings.PAYOUT_SWITCH:
        bank_details = get_bank_details_for_beneficiary(user)
        if bank_details:
            bene_info = get_beneficiary_id_for_user(user.id)
            bene_info.beneficiary_checked = False
            bene_info.save()
            exists = check_beneficiary_exists(bank_details['beneId'])
            if exists:
                is_deleted = delete_beneficiary(bank_details['beneId'])
                if is_deleted:
                    created = create_beneficiary(bank_details)
            else:
                created = create_beneficiary(bank_details)
            if created:
                if bene_info.beneficiary_id == created:
                    bene_info.beneficiary_checked = True
                    bene_info.save()
                return True
    return False


def check_beneficiary_exists(beneficiary_id):
    try:
        Payouts.init(settings.PAYOUT_CLIENT_ID, settings.PAYOUT_CLIENT_SECRET, settings.PAYOUTENV)
        beneficiary = PayoutBeneficiary.get_bene_details(beneficiary_id)
        response = beneficiary.json()
        if response.get('status', '') == 'SUCCESS' and response.get('subCode', '') == '200':
            return True
        else:
            return False
    except IncorrectCredsError as e:
        _logger.info("IP not whitelisted or incorrect credientials")
    except EntityDoesntExistError as e:
        _logger.info("Beneficiary id %s not found", beneficiary_id)
    except Exception as e:
        _logger.warn("Beneficiary id %s check error %s", beneficiary_id, e)
    return False


def delete_beneficiary(beneficiary_id):
    try:
        Payouts.init(settings.PAYOUT_CLIENT_ID, settings.PAYOUT_CLIENT_SECRET, settings.PAYOUTENV)
        beneficiary = PayoutBeneficiary.remove_bene(beneficiary_id)
        response = beneficiary.json()
        if response.get('status', '') == 'SUCCESS' and response.get('subCode', '') == '200':
            return True
        else:
            return False
    except IncorrectCredsError as e:
        _logger.info("IP not whitelisted or incorrect credientials")
    except BadRequestError as e:
        _logger.warn("Beneficiary id %s delete error", beneficiary_id, e)
    except Exception as e:
        _logger.warn("Beneficiary id %s delete error %s", beneficiary_id, e)
    return False


def create_beneficiary(data):
    email = data.get('email', None)
    phone = data.get('phone', None)
    address1 = data.get('address1')
    name = data.get('name', None)
    bankAccount = data.get('bankAccount', None)
    ifsc = data.get('ifsc', None)
    beneId = data.get('beneId', None)
    user_id = data.get('user_id', None)

    if not beneId or not name or not email or not phone or not address1 or not bankAccount or not ifsc:
        _logger.warn("Invalid beneficiary details for auditor id %s",user_id)
        raise AppLogicError("Please complete all details.")

    try:
        Payouts.init(settings.PAYOUT_CLIENT_ID, settings.PAYOUT_CLIENT_SECRET, settings.PAYOUTENV)
        beneficiary = PayoutBeneficiary.add(beneId=beneId, name=name, email=email, phone=phone, address1=address1, bankAccount=bankAccount, ifsc=ifsc)
        response = beneficiary.json()
        if response.get('status', '') == 'SUCCESS' and response.get('subCode', '') == '200':
            return beneId
        else:
            _logger.warn("Beneficiary not created for auditor id %s %s", user_id, response)
            return False
    except IncorrectCredsError as e:
        _logger.info("IP not whitelisted or incorrect credientials")
    except AlreadyExistError as e:
        return beneId
    except Exception as e:
        _logger.warn("Beneficiary creation error for auditor %s = %s", user_id, e)
    return False
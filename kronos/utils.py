import re
import json
import logging
from dateutil.relativedelta import relativedelta
from datetime import datetime

from django.utils import timezone
from django.conf import settings

from kronos.exceptions import AppLogicError

import convertapi

__logger = logging.getLogger(__name__)

def get_color_code_by_percentage(percentage):
    if percentage is None:
        return 0

    if percentage > 89:
        return 5
    elif percentage > 84:
        return 4
    elif percentage > 74:
        return 3
    elif percentage > 65:
        return 2
    elif percentage >= 0:
        return 1
    else:
        return 0


def get_rank_by_percentage(percentage):
    if percentage is None:
        return None

    if percentage > 89:
        return 1
    elif percentage > 84:
        return 2
    elif percentage > 74:
        return 3
    elif percentage > 65:
        return 4
    elif percentage >= 0:
        return 5
    else:
        return None


def get_color_code(marks_obtained, max_marks):
    if marks_obtained is None:
        marks_obtained = 0

    if max_marks is not 0:
        percentage = int((marks_obtained * 100) / max_marks)
    else:
        percentage = -1

    return get_color_code_by_percentage(percentage)


def get_color_hex_from_code(color_code):
    colors = ("#F1F1F1", "#FFC299", "#FFEB99", "#FFFF99", "#EAFF99", "#C1FF99")
    return colors[color_code]


IST = timezone.pytz.timezone("Asia/Kolkata")

def now_ist():
    return timezone.localtime(timezone.now(), IST)


def today_ist():
    return timezone.localtime(timezone.now(), IST).date()


def find_payment_due_date(date):
    future_date = date + relativedelta(months=2)
    return datetime(future_date.year, future_date.month, 15)

def get_difference_between_date(date_val):
    today = today_ist()
    diff = today - date_val
    return diff.days


def calculate_age(birthdate):
    today = datetime.date.today()
    try:
        birthday = birthdate.replace(year = today.year)
    except ValueError:
        birthday = birthdate.replace(year = today.year, month = birthdate.month + 1, day = 1)

    if birthday > today:
        return today.year - birthdate.year - 1
    else:
        return today.year - birthdate.year


def view_log(func, method=None, *outerargs):
    _logger = logging.getLogger("function:view_log")

    def wrapper(*args, **kwargs):
        user="unknown"
        post_data="unknown"
        get_data="unknown"
        body="unknown"
        try:
            user = args[0].user
            req_method = args[0].method
            post_data = args[0].POST
            get_data = args[0].GET
            user_agent = args[0].META['HTTP_USER_AGENT']
            body = args[0].body
        except AttributeError:
            pass

        if (method and method == req_method) or not method:
            _logger.info("view: \033[1m%s\033[0m called", func.__name__)
            _logger.info(" ├╌\033[1muser  \033[0m: %s, UA: %s", user, user_agent)
            _logger.info(" ├╌\033[1margs  \033[0m: %s", args)
            _logger.info(" ├╌\033[1mkwargs\033[0m: %s", kwargs)
            _logger.info(" ├╌\033[1mGET   \033[0m: %s", get_data)
            _logger.info(" ├╌\033[1mPOST  \033[0m: %s", post_data)
            _logger.info(" ├╌\033[1mbody  \033[0m: %s", body)

        ret_val = func(*args, **kwargs)

        if (method and method == req_method) or not method:
            _logger.info(" ├╌\033[1mstatus\033[0m: %s", ret_val.status_code)
            _logger.info(" ╰╌\033[1mdata  \033[0m: %s", ret_val.data)

        return ret_val

    return wrapper


with open("./datasets/IFSC-list.json","r") as ifsc_file:
    ifsc_list = json.load(ifsc_file)
    __logger.info("loaded %d IFSC codes", len(ifsc_list))

with open("./datasets/banknames.json","r") as bank_file:
    bank_list = json.load(bank_file)
    __logger.info("loaded %d banks", len(bank_list))

with open("./datasets/pincode.json") as pincode_file:
    pincode_list = json.load(pincode_file)
    __logger.info("loaded %d pincodes", len(pincode_list))

with open("./datasets/dialcode.json") as dialcode_file:
    dialcode_list = json.load(dialcode_file)
    __logger.info("loaded %d dialcodes", len(dialcode_list))

with open("./datasets/audio_transcription_language_code.json") as language_code_file:
    language_code_list = json.load(language_code_file)
    __logger.info("loaded %d langugae_code", len(language_code_list))

def get_lat_lon_from_pincode(pincode):
    if pincode in pincode_list:
        return pincode_list[pincode]
    else:
        return None

def validate_ifsc(ifsc_code):
    return len(ifsc_code) is 11 and str.upper(ifsc_code) in ifsc_list


def get_bank_name_from_ifsc(ifsc_code):
    return bank_list.get(ifsc_code[:4])


pan_pattern = re.compile("[A-Z]{3}[ABCFGHLJPTK][A-Z]\d{4}[A-Z]", flags=re.ASCII)

def validate_pan(pan_number):
    return pan_pattern.match(str.upper(pan_number))


def get_language_code_by_country_code(country_code):
    if country_code in language_code_list:
        return language_code_list[country_code]
    else:
        return None

def get_dialcode(country_code):
    if country_code in dialcode_list:
        return dialcode_list[country_code]
    else:
        return None

def split_date_range_from_string(date_range: str) -> list:
    msg = 'Incorrect date range format'

    if not date_range or ' - ' not in date_range:
        raise AppLogicError(msg)

    split_str = date_range.split(' - ')
    if ' - ' not in date_range or len(split_str) != 2 or not split_str[0] or not split_str[1]:
        raise AppLogicError(msg)

    try:
        start_date = datetime.strptime(split_str[0], '%Y-%m-%d').date()
        end_date = datetime.strptime(split_str[1], '%Y-%m-%d').date()
    except ValueError as e:
        raise AppLogicError(e)

    return [start_date, end_date]


def validate_date_range_from_string(date_range: str) -> bool:
    if date_range == '':
        return True

    date_range_list = split_date_range_from_string(date_range)
    if date_range_list:
        if date_range_list[0] > date_range_list[1] or date_range_list[1] < date_range_list[0]:
            return False
        else:
            return True
    else:
        return False


def validate_url(url_string: str) -> bool:
    regex = ("((http|https)://)(www.)?" +
             "[a-zA-Z0-9@:%._\\+~#?&//=]" +
             "{2,256}\\.[a-z]" +
             "{2,6}\\b([-a-zA-Z0-9@:%" +
             "._\\+~#?&//=]*)")

    p = re.compile(regex)

    if url_string is None:
        return False

    if(re.search(p, url_string)):
        return True
    else:
        return False


def generate_pdf_from_api(html_data: str):
    """Generate PDF file from convertapi service

    Return a response in pdf format (BytesIo)
    """

    if settings.RAZORPAY_SWITCH == "False":
        raise AppLogicError("Invoice is not available")

    try:
        convertapi.api_secret = settings.CONVERT_API_SECRET
        upload_io = convertapi.UploadIO(html_data.encode("utf-8"), filename="invoice.html")
        params = {"File": upload_io, "StoreFile": False}
        res = convertapi.convert('pdf', params)
        return res.file.io
    except Exception as e:
        raise AppLogicError("Error while creating pdf")

def validate_business_email(email):
    emails = ["gmail.com", "yahoo.com", "hotmail.com", "yahoo.co.in", "aol.com", "abc.com", "xyz.com", "pqr.com", "rediffmail.com", "live.com", "outlook.com", "me.com", "msn.com", "ymail.com", "example.com"]
    for i in emails:
        if email.endswith(i):
            return False
    return True


with open("./datasets/quotation_data.json") as quotation_data_file:
    quotation = json.load(quotation_data_file)
    industry_list = quotation["industry"]
    audit_category_list = quotation["audit_category"]
    audit_type_list = quotation["audit_type"]
    tier_wise_markup = quotation["tier_markup"]
    audit_volume_discount = quotation["audit_volume_discount"]

    __logger.info("loaded quotation data")

def get_markup_price(base_rate, markup):
    if markup == 0:
        return base_rate
    else:
        return (markup / 100) * base_rate

def find_audit_volume_discount(audit_volume):
    if(audit_volume <= 10):
        return audit_volume_discount["10"]
    elif(audit_volume <= 50):
        return audit_volume_discount["50"]
    elif(audit_volume <= 100):
        return audit_volume_discount["100"]
    elif(audit_volume <= 500):
        return audit_volume_discount["500"]
    else:
        return 0

def get_industry_list():
    return industry_list

def get_audit_category_list():
    return audit_category_list

def get_audit_type_list():
    return audit_type_list

def get_tier_markup_list():
    return tier_wise_markup
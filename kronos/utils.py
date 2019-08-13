import re
import json
import logging

from django.utils import timezone

__logger = logging.getLogger(__name__)

def get_color_code_by_percentage(percentage):
    if percentage is None:
        return 0

    if percentage > 90:
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

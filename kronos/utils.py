import logging

from django.utils import timezone

def get_color_code_by_percentage(percentage):
    if percentage is None:
        return 0

    if percentage > 80:
        return 4
    elif percentage > 60:
        return 3
    elif percentage > 40:
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
    colors = ("#FFFFFF", "#F2DEDE", "#FCF8E3", "#D9EDF7", "#DFF0D8")
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

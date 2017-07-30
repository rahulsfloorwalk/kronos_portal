from model_mommy.recipe import Recipe

from auditor.models import AdditionalInfo

additional_info_recipe = Recipe(AdditionalInfo,
        has_car = False,
        camera_owned = False,
        camera_resoulution = False,
        pda_owned = False,
        smart_phone_owned = False,
        laptop_owned = False,
        fax_access = False,
        scanner_access = False,
        weekend_audit = False,
        _fill_optional=True,
        )
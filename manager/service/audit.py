from django.db.transaction import atomic
from django.contrib.auth.models import User

from kronos.exceptions import ObjectNotFound, AppLogicError
from audit.models import AuditCycle, Audit
from audit_store.models import AuditStore
from datetime import datetime, timedelta, date
current_date = datetime.now()
seven_days_from_now = current_date + timedelta(days=7)

@atomic
def fiat_assign(audit_id, email, audit_date, reimbursement, earnings_per_audit, audit_count, user_actor):
    try:
        user = User.objects.get(email__iexact=email)
        audit = Audit.objects.get(pk=audit_id)
        audit_cycle = audit.audit_cycle
    except (Audit.DoesNotExist, AuditCycle.DoesNotExist) as e:
        raise ObjectNotFound from e
    except (User.DoesNotExist) as e:
        raise AppLogicError("email is not valid") from e

    #print("current date",current_date.date(), "audit date",audit_date)
    #if audit_date < current_date.date() or audit_date > seven_days_from_now.date():

        # raise AppLogicError("audit date is out of range")
        #raise AppLogicError("audit date " + str(audit_date) + " is out of range (current date: " + str(current_date.date()) + ")")
    if audit_cycle.status == AuditCycle.ARCHIVED:
        raise AppLogicError("audit_cycle is archived")

    audit_store_list = []
    for _ in range(audit_count):
        if audit_cycle.check_points:
            check_points = audit_cycle.check_points
            checkpoints_list = check_points.split(";")
            check_points_id = 1
            checkpoints_dict = {}
            for i in checkpoints_list:
                if i.strip():
                    checkpoints_dict[str(check_points_id)] = {"checkpoint": i.strip(), "value": False}
                    check_points_id += 1
        else:
            checkpoints_dict = {}
        audit_store_list.append(
            AuditStore.objects.assign_audit_store(audit, audit_date, user, reimbursement, earnings_per_audit, checkpoints_dict, user_actor)
        )
    return audit_store_list

def get_latest_audit_cycle_for_client(client_id, audit_cycle_type):
    if audit_cycle_type is None:
        try:
            return AuditCycle.objects.filter(client_id=client_id).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available') from e
    else:
        try:
            return AuditCycle.objects.filter(client_id=client_id, type=audit_cycle_type).order_by('-end_date')[0]
        except IndexError as e:
            raise ObjectNotFound('Audit cycle not available') from e
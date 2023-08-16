import logging
from django.db.transaction import atomic
from django.db.models import Count, Avg
from auditor.models import ProfileInfo,AuditorRating
from django.contrib.auth.models import User
from registration.models import GROUP_NAME_AUDITOR
from kronos.celery import app
from celery.result import ResultSet
from client.service import client_service
from client.models import Client,Store,ClientUser,NonClientAdminUserStore
from auditor.service import stats
from audit_store.models import AuditStore
from audit.models import AuditCycle,Audit
from manager.viewss.client_user import ClientUserSerializer
_logger = logging.getLogger(__name__)

# from notify.service import tattva_reporting_to_admin
# obj=tattva_reporting_to_admin
# obj.tattva_reporting_to_admin_after_48_hour_not_logged_in_non_admin_client_user()


# @app.task(iqnore_result=True)
# def tattva_reporting_to_admin_after_48_hour_not_logged_in_non_admin_client_user():
#     client_id = 1 # Hardcoded
#     client_users = ClientUser.objects.filter(client_id=client_id,receive_email_notification=True)
#     non_client_users = [user for user in client_users if not user.user.has_perm('client.clientuser_admin')]
#     non_client_list=[]
#     for user in non_client_users:
#         non_client_stores = NonClientAdminUserStore.objects.filter(client_user=user.id)
#         for store_instance in non_client_stores:
#             non_client_list.append({'name':user.full_name,'email':user.user.email,'store_list':store_instance.get_store_list()})
#             audit=Audit.objects.filter(store__in=store_instance.get_store_list())
#             for i in audit:
#                 audit_store=AuditStore.objects.filter(audit=i,status=AuditStore.COMPLETED)
#                 if audit_store:
#                     print('35',audit_store)
#                 else:
#                     continue
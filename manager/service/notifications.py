from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from kronos.exceptions import ObjectNotFound, AppLogicError
from registration.models import GROUP_NAME_MANAGER, GROUP_NAME_MODERATOR

from notify import verbs


def find_by_recipient_user_and_verb_and_actor(user_id, verb=None, before=None, actor_id=None):
    try:
        user = User.objects.get(pk=user_id)

        qs = user.notifications.prefetch_related(
            'actor',
            'target',
            'action_object__audit',
            'action_object__audit__store',
            'action_object__audit__store__city',
            'action_object__audit__store__client',
            'action_object__audit__audit_cycle',
            'action_object__audit__audit_cycle__client',
        )
        # HACK: works only because 'action_object' is currently an instance of AuditStore or AuditApplication.
        # anything else and it will break
        # since 'target' can be of type Audit, AuditStore, AuditApplication we cannot apply similar prefetches to it

        if verb:
            if verb not in [v for v in dir(verbs) if not v.startswith("__")]:
                raise AppLogicError("invalid verb")
            else:
                qs = qs.filter(verb=verb)

        if actor_id:
            qs = qs.filter(actor_object_id=actor_id, actor_content_type=ContentType.objects.get(app_label="auth", model="user"))

        if before not in (None, ""):
            qs = qs.filter(timestamp__lt=before)

        return qs.all()[:10]
    except User.DoesNotExist as e:
        raise ObjectNotFound from e


def find_filterable_actors():
    return User.objects.filter(groups__name__in=(GROUP_NAME_MODERATOR, GROUP_NAME_MANAGER))

from django.db.transaction import atomic

from kronos.exceptions import ObjectNotFound, AppLogicError
from manager.service.trainer import find_by_id
from ..models import ClientTrainer


def find_client_trainer_by_id(client_trainer_id):
    try:
        return ClientTrainer.objects.get(id=client_trainer_id)
    except ClientTrainer.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def insert(client, trainer_id, receive_email_notification, is_active):
    if ClientTrainer.objects.filter(client=client, user__id=trainer_id).exists():
        raise AppLogicError("a trainer is already exists in this client")
    else:
        trainer = find_by_id(trainer_id)

        client_trainer = ClientTrainer()
        client_trainer.client = client
        client_trainer.user = trainer
        client_trainer.receive_email_notification = receive_email_notification
        client_trainer.is_active = is_active
        client_trainer.save()

        return client_trainer


def update(client_trainer_id, receive_email_notification, is_active):
    client_trainer = find_client_trainer_by_id(client_trainer_id)
    client_trainer.receive_email_notification = receive_email_notification
    client_trainer.is_active = is_active
    client_trainer.save()
    return client_trainer


def get_trainer_email_list_by_audit_store_obj(audit_store):
    trainer_email_list = []
    client_trainers = ClientTrainer.objects.filter(client__id=audit_store.audit.audit_cycle.client.id,
                                                   is_active=True, receive_email_notification=True)
    for cm in client_trainers:
        trainer_email_list.append(cm.user.email)
    return trainer_email_list

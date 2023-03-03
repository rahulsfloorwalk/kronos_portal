from django.db.transaction import atomic
from kronos.exceptions import AppLogicError, ObjectNotFound
from ..models import ProofTag


def find_all():
    return ProofTag.objects.filter().order_by('-is_active')


def find_by_id(proof_tag_id):
    try:
        return ProofTag.objects.get(id=proof_tag_id)
    except ProofTag.DoesNotExist as e:
        raise ObjectNotFound from e


@atomic
def insert(name, description, is_active):
    if name == "":
        raise AppLogicError("proof tag cannot be blank")
    if ProofTag.objects.filter(name=name).exists():
        raise AppLogicError("proof tag already exists")

    proof_tag = ProofTag()
    proof_tag.name = name
    proof_tag.description = description
    proof_tag.is_active = is_active
    proof_tag.save()
    return proof_tag


@atomic
def update(proof_tag_id, name, description, is_active):
    if name == "":
        raise AppLogicError("proof tag cannot be blank")
    if ProofTag.objects.filter(name=name).exclude(id=proof_tag_id).exists():
        raise AppLogicError("proof tag already exists")

    proof_tag = ProofTag.objects.get(id=proof_tag_id)
    proof_tag.name = name
    proof_tag.description = description
    proof_tag.is_active = is_active
    proof_tag.save()
    return proof_tag

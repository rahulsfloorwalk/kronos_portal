from django.db.models import Model, AutoField, CharField, DecimalField, ForeignKey, DateTimeField, PROTECT, PositiveIntegerField
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.postgres.fields import JSONField

class Payment(Model):

    CREATED = 'CREATED'
    PENDING = 'PENDING'
    PAID = 'PAID'
    FAILED = 'FAILED'

    STATUS = (
        (PENDING, "Pending"),
        (PAID, "Paid"),
        (FAILED, "Failed"),
    )

    id = AutoField(db_column='id', primary_key=True)
    payment_order_id = CharField(max_length=100, null=True)
    amount = DecimalField(db_column='amount', decimal_places=1, max_digits=10, null=False)
    gst = DecimalField(db_column='gst', decimal_places=1, max_digits=10, null=False)
    status = CharField(db_column='status', max_length=20, choices=STATUS, blank=False, default=CREATED)

    content_type = ForeignKey(ContentType, on_delete=PROTECT)
    object_id = PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    added_on = DateTimeField(db_column='added_on', auto_now_add=True, null=False)
    paid_on = DateTimeField(db_column='paid_on', null=True)
    payment_data = JSONField(db_column='payment_data', default=dict)
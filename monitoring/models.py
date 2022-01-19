from django.db.models import Model, CharField, AutoField, DateTimeField, EmailField, TextField

class EmailLog(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    sent_to = EmailField(db_column='sent_to')
    subject = CharField(db_column='name', max_length=200)
    html_body = TextField(db_column='html_body')
    text_body = TextField(db_column='text_body')
    sent_at = DateTimeField(db_column='sent_at')

    class Meta:
        ordering = ['-sent_at']


class MessageLog(Model):
    id = AutoField(db_column='id', primary_key=True)
    sent_to = CharField(db_column='mobile_number', max_length=10)
    message_status = CharField(db_column='message_status', max_length=50)
    sent_at = DateTimeField(db_column='sent_at')

    class Meta:
        ordering = ['-sent_at']

class WhatsappLog(Model):
    sent_to = CharField(db_column='whatsapp_number', max_length=10)
    communication_id = CharField(db_column='communication_id', max_length = 200)
    message_id = CharField(db_column='message_id', max_length = 200)

    sent_at = DateTimeField(db_column='sent_at')

    class Meta:
        ordering = ['-sent_at']
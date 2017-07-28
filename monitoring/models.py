from django.db.models import Model, CharField, AutoField, DateTimeField, EmailField, TextField

class EmailLog(Model):
    id = AutoField(db_column = 'id', primary_key=True)
    sent_to = EmailField(db_column='sent_to')
    subject = CharField(db_column='name', max_length=128)
    html_body = TextField(db_column='html_body')
    text_body = TextField(db_column='text_body')
    sent_at = DateTimeField(db_column='sent_at')

    class Meta:
        ordering = ['-sent_at']

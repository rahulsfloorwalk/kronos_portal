from django.contrib import admin

from .models import Section, Question
from questionnaire.models import QuestionnaireType

# Register your models here.
admin.site.register(Section)
admin.site.register(Question)
admin.site.register(QuestionnaireType)

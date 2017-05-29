import csv
from django.db import IntegrityError, transaction
from questionnaire.models import Question

@transaction.atomic
def insert_questions():
    filename = 'scripts/data/wills_questionnaire.csv'
    with open(filename) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            question = Question()
            question.question_txt = row['question_txt']
            question.sequence = row['sequence']
            question.max_marks = row['max_marks']
            question.section_id = row['section_id']
            question.save()

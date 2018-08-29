from django.contrib.auth.models import User, Group
from django.db.transaction import atomic

from django.db.models import Model, QuerySet
from django.db.models import CharField, AutoField, ForeignKey, OneToOneField
from django.db.models import PROTECT
from django.conf import settings

from registration.models import GROUP_NAME_AGENCY

class AgencyUserQuerySet(QuerySet):
    def find_by_user_id(self, user_id):
        return self.get(user_id=user_id)

    def find_by_presence_in_city_id(self, city_id):
        return self.filter(agency__presences__city_id=city_id)

    @atomic
    def create_agency_user(self, email, password, agency, full_name):
        user = User.objects.create_user(email, email=email, password=password)
        user.groups.add(Group.objects.get(name=GROUP_NAME_AGENCY))
        user.save()

        agency_user = AgencyUser()
        agency_user.user = user
        agency_user.full_name = full_name
        agency_user.agency = agency
        agency_user.save()

        return agency_user

class AgencyUser(Model):
    objects = AgencyUserQuerySet.as_manager()

    id = AutoField(db_column = 'id', primary_key=True)
    full_name = CharField(db_column='full_name', max_length=50, blank=False)
    agency = ForeignKey('agency.Agency', related_name='users', db_column='agency_id', blank=False, on_delete=PROTECT)
    user = OneToOneField(settings.AUTH_USER_MODEL, db_column='user_id', on_delete=PROTECT)

    def __str__(self):
        return 'AgencyUser({}): {}, agency: {}, user: {}'.format(self.id, self.full_name, self.agency, self.user_id)


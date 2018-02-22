from django.db.models import Model, QuerySet
from django.db.models import AutoField, ForeignKey, BooleanField
from django.db.models import PROTECT

from agency.models import Agency
from manager.models import City

class AgencyPresenceQuerySet(QuerySet):
    def find_by_user_and_state(self, user, state_code):
        agency = user.agencyuser.agency
        return AgencyPresence.objects.filter(agency=agency, city__state=state_code)

    def find_by_agency_and_city(self, agency, city):
        presence, _ = AgencyPresence.objects.get_or_create(agency=agency, city=city)
        return presence

    def find_by_user_and_city(self, user, city):
        agency = user.agencyuser.agency
        return self.find_by_agency_and_city(agency, city)


class AgencyPresence(Model):
    objects = AgencyPresenceQuerySet.as_manager()

    id = AutoField(db_column = 'id', primary_key=True)
    present = BooleanField(db_column='present', default=False, blank=False, null=False)
    agency = ForeignKey(Agency, related_name='presences', db_column='agency_id', blank=False, on_delete=PROTECT)
    city = ForeignKey(City, db_column='city_id', blank=False, on_delete=PROTECT)

    def set_presence(self, presence):
        self.present = presence
        self.save()

    def __str__(self):
        return 'AgencyPresence({}): agency: {}, city: {}'.format(self.id, self.agency, self.city)

    class Meta:
        unique_together = (("city", "agency"))

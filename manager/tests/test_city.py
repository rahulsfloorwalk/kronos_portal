from django.test import TestCase
from manager.models import City

from expects import expect, equal, be_none

class CityTestCase(TestCase):
    def test_state_name_returns_the_name_of_the_state_based_on_the_code(self):
        city = City(name="Foo", state="IN-MH")
        expect(city.state_name()).to(equal("Maharashtra"))

    def test_state_name_returns_none_if_the_code_is_invalid(self):
        city = City(name="Foo", state="US-CA")
        expect(city.state_name()).to(be_none)

from manager.models import City
from django.db.utils import DataError, IntegrityError
import csv
with open('cities.csv') as data:
    datar = csv.DictReader(data)
    for row in datar:
        try:
            city = City()
            city.name = row['city']
            city.state = row['state']
            city.save()
        except AttributeError:
            print("attriberror")
        except ValueError:
            print("valueerror")
        except DataError:
            print("dataerror")

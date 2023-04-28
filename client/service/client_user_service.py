from client.models import ClientForEcomm
from django.contrib.auth.hashers import make_password
from django.utils import timezone
def save(client):
    data=ClientForEcomm()
    data.first_name=client.first_name
    data.last_name=client.last_name
    data.email=client.email
    data.phone_number=client.phone_number
    data.company=client.company
    data.password=client.password
    data.encrypt_password= make_password(client.password)
    data.address = client.address
    data.city = client.city
    data.state = client.state
    data.pincode = client.pincode
    data.gst_in = client.gst_in
    data.created_at = timezone.now()
    data.save()
    return data

def find_all_client_users():
    return ClientForEcomm.objects.all()
from django.forms import ModelForm, CharField
from .models import ProfileInfo, AdditionalInfo, BankInfo

class ProfileInfoForm(ModelForm):
    class Meta:
        model = ProfileInfo
        fields = ['first_name', 'last_name', 'gender', 'marital_status', 'education',
                'mobile_number', 'date_of_birth', 'address', 'pincode', 'city']

class AdditionalInfoForm(ModelForm):
    class Meta:
        model = AdditionalInfo
        fields = ['has_car', 'weekend_audit']

class BankInfoForm(ModelForm):
    class Meta:
        model = BankInfo
        fields = ['bank_name', 'account_holder_name', 'account_number', 'ifsc_code']

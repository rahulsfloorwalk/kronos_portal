from rest_framework import routers, viewsets
from rest_framework.serializers import ModelSerializer, ValidationError

from .models import ProfileInfo, AdditionalInfo, BankInfo


class ProfileInfoSerializer(ModelSerializer):
    class Meta:
        model = ProfileInfo
        fields = (
            'id', 
            'first_name', 
            'last_name', 
            'gender', 
            'marital_status', 
            'education',
            'mobile_number', 
            'date_of_birth', 
            'address', 
            'pincode', 
            'city', 
            'state',
            'user_id'
        )
        read_only_fields = ('id', 'user_id')

    def save(self, **kwargs):
        if 'current_user' not in kwargs:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            profile_info = ProfileInfo.objects.get(user_id=kwargs['current_user'].id)
        except ProfileInfo.DoesNotExist:
            profile_info = ProfileInfo()
            profile_info.user_id = kwargs['current_user'].id

        profile_info.first_name = self.validated_data.get('first_name', profile_info.first_name)
        profile_info.last_name = self.validated_data.get('last_name', profile_info.last_name)
        profile_info.gender = self.validated_data.get('gender', profile_info.gender)
        profile_info.marital_status = self.validated_data.get('marital_status', profile_info.marital_status)
        profile_info.education = self.validated_data.get('education', profile_info.education)
        profile_info.mobile_number = self.validated_data.get('mobile_number', profile_info.mobile_number)
        profile_info.date_of_birth = self.validated_data.get('date_of_birth', profile_info.date_of_birth)
        profile_info.address = self.validated_data.get('address', profile_info.address)
        profile_info.pincode = self.validated_data.get('pincode', profile_info.pincode)
        profile_info.city = self.validated_data.get('city', profile_info.city)
        profile_info.state = self.validated_data.get('state', profile_info.state)

        profile_info.save()
        return profile_info



class AdditionalInfoSerializer(ModelSerializer):
    class Meta:
        model = AdditionalInfo
        fields = (
            'id', 
            'has_car', 
            'weekend_audit', 
            'user_id'
        )
        read_only_fields = ('id', 'user_id')

    def save(self, **kwargs):
        if 'current_user' not in kwargs:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            additional_info = AdditionalInfo.objects.get(user_id=kwargs['current_user'].id)
        except AdditionalInfo.DoesNotExist:
            additional_info = AdditionalInfo()
            additional_info.user_id = kwargs['current_user'].id

        additional_info.has_car = self.validated_data.get('has_car', additional_info.has_car)
        additional_info.weekend_audit = self.validated_data.get('weekend_audit', additional_info.weekend_audit)

        additional_info.save()
        return additional_info


class BankInfoSerializer(ModelSerializer):
    class Meta:
        model = BankInfo
        fields = (
            'id', 
            'bank_name', 
            'account_holder_name', 
            'account_number',
            'ifsc_code',
            'user_id'
        )
        read_only_fields = ('id', 'user_id')

    def save(self, **kwargs):
        if 'current_user' not in kwargs:
            raise TypeError("missing keyword argument 'current_user'")

        try:
            bank_info = BankInfo.objects.get(user_id=kwargs['current_user'].id)
        except BankInfo.DoesNotExist:
            bank_info = BankInfo()
            bank_info.user_id = kwargs['current_user'].id

        bank_info.bank_name = self.validated_data.get('bank_name', bank_info.bank_name)
        bank_info.account_holder_name = self.validated_data.get('account_holder_name', bank_info.account_holder_name)
        bank_info.account_number = self.validated_data.get('account_number', bank_info.account_number)
        bank_info.ifsc_code = self.validated_data.get('ifsc_code', bank_info.ifsc_code)

        bank_info.save()
        return bank_info

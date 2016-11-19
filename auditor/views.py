from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError

from kronos.exceptions import ObjectNotFound, AppLogicError
from .models import ProfileInfo, BankInfo, AdditionalInfo
from .forms import ProfileInfoForm, AdditionalInfoForm, BankInfoForm
from .serializers import ProfileInfoSerializer, AdditionalInfoSerializer, BankInfoSerializer
from .serializers import AuditApplicationSerializer, AuditApplicationApplyDeSerializer, AuditApplicationCancelDeSerializer
from manager.models import Audit, City
from manager.serializers import AuditSerializer, CitySerializer
import manager.service.audit as audit_service
from manager import states

@login_required
def dashboard(request):
    try:
        profile_info = ProfileInfo.objects.get(user_id=request.user.id)
    except ProfileInfo.DoesNotExist:
        profile_info = None
    return render(request, "auditor/dashboard.html", { 'profile_info': profile_info })

@login_required
def profile(request):
    try:
        profile_info = ProfileInfo.objects.get(user_id=request.user.id)
    except ProfileInfo.DoesNotExist:
        profile_info = None
    try:
        additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
    except AdditionalInfo.DoesNotExist:
        additional_info = None
    try:
        bank_info = BankInfo.objects.get(user_id=request.user.id)
    except BankInfo.DoesNotExist:
        bank_info = None
    context = {
        'profile_info': profile_info,
        'additional_info': additional_info,
        'bank_info': bank_info
    }
    return render(request, "auditor/profile.html", context)


class ProfileInfoFormView(View):
    __template = 'auditor/profile_info_form.html'

    @method_decorator(login_required)
    def get(self, request):
        try:
            profile_info = ProfileInfo.objects.get(user_id=request.user.id)
        except ProfileInfo.DoesNotExist:
            profile_info = None
        form = ProfileInfoForm(instance=profile_info)
        return render(request, self.__template, {'form': form})

    @method_decorator(login_required)
    def post(self, request):
        try:
            profile_info = ProfileInfo.objects.get(user_id=request.user.id)
        except ProfileInfo.DoesNotExist:
            profile_info = None
        form = ProfileInfoForm(data=request.POST, instance=profile_info)
        if form.is_valid():
            profile_info = form.save(commit=False)
            profile_info.user = request.user
            profile_info.save()
            return redirect('auditor:profile')
        return render(request, self.__template, {'form': form})

class AdditionalInfoFormView(View):
    __template = 'auditor/additional_info_form.html'

    @method_decorator(login_required)
    def get(self, request):
        try:
            additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
        except AdditionalInfo.DoesNotExist:
            additional_info = None
        form = AdditionalInfoForm(instance=additional_info)
        return render(request, self.__template, {'form': form})

    @method_decorator(login_required)
    def post(self, request):
        try:
            additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
        except AdditionalInfo.DoesNotExist:
            additional_info = None
        form = AdditionalInfoForm(data=request.POST, instance=additional_info)
        if form.is_valid():
            additional_info = form.save(commit=False)
            additional_info.user = request.user
            additional_info.save()
            return redirect('auditor:profile')
        return render(request, self.__template, {'form': form})


class BankInfoFormView(View):
    __template = 'auditor/bank_info_form.html'

    @method_decorator(login_required)
    def get(self, request):
        try:
            bank_info = BankInfo.objects.get(user_id=request.user.id)
        except BankInfo.DoesNotExist:
            bank_info = None
        form = BankInfoForm(instance=bank_info)
        return render(request, self.__template, {'form': form})

    @method_decorator(login_required)
    def post(self, request):
        try:
            bank_info = BankInfo.objects.get(user_id=request.user.id)
        except BankInfo.DoesNotExist:
            bank_info = None
        form = BankInfoForm(data=request.POST, instance=bank_info)
        if form.is_valid():
            bank_info = form.save(commit=False)
            bank_info.user = request.user
            bank_info.save()
            return redirect('auditor:profile')
        return render(request, self.__template, {'form': form})


class ProfileInfoView(APIView):
    def get(self, request, format=None):
        try:
            profile_info = ProfileInfo.objects.get(user_id=request.user.id)
            return Response(ProfileInfoSerializer(profile_info).data)
        except ProfileInfo.DoesNotExist:
            raise Http404

    def post(self, request):
        profile_info_s = ProfileInfoSerializer(data=request.data)
        profile_info_s.is_valid(raise_exception=True)
        profile_info = profile_info_s.save(current_user=request.user)
        return Response(ProfileInfoSerializer(profile_info).data)

class AdditionalInfoView(APIView):
    def get(self, request, format=None):
        try:
            additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
            return Response(AdditionalInfoSerializer(additional_info).data)
        except AdditionalInfo.DoesNotExist:
            return Response(AdditionalInfoSerializer(AdditionalInfo()).data)

    def post(self, request):
        additional_info_s= AdditionalInfoSerializer(data=request.data)
        additional_info_s.is_valid(raise_exception=True)
        additional_info = additional_info_s.save(current_user=request.user)
        return Response(AdditionalInfoSerializer(additional_info).data)


class BankInfoView(APIView):
    def get(self, request, format=None):
        try:
            bank_info = BankInfo.objects.get(user_id=request.user.id)
            return Response(BankInfoSerializer(bank_info).data)
        except BankInfo.DoesNotExist:
            return Response(BankInfoSerializer(BankInfo()).data)

    def post(self, request):
        bank_info_s = BankInfoSerializer(data=request.data)
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.save(current_user=request.user)
        return Response(BankInfoSerializer(bank_info).data)

class AvailableAuditsView(APIView):
    def get(self, request, format=None):
        available_audits = audit_service.get_available_audits()
        return Response(AuditSerializer(available_audits, many=True).data)

class AuditView(APIView):
    def get(self, request, audit_id, format=None):
        audit = Audit.objects.get(id=audit_id)
        return Response(AuditSerializer(audit).data)

class AuditApplicationsView(APIView):
    def get(self, request, audit_id, format=None):
        try:
            applications = audit_service.get_applications(audit_id, ProfileInfo.objects.get(user_id=request.user.id).id)
        except ObjectNotFound as e:
            raise NotFound()
        return Response(AuditApplicationSerializer(applications, many=True).data)

class AuditApplicationView(APIView):
    def get(self, request, audit_id, location_id, format=None):
        try:
            application = audit_service.get_application(audit_id, location_id, ProfileInfo.objects.get(user_id=request.user.id).id)
        except ObjectNotFound as e:
            raise NotFound()
        return Response(AuditApplicationSerializer(application).data)


class AuditApplicationApplyView(APIView):
    def post(self, request, audit_id, location_id, format=None):
        request.data["audit_id"] = audit_id
        request.data["location_id"] = location_id
        request.data["profileinfo_id"] = ProfileInfo.objects.get(user_id=request.user.id).id

        application_apply_ds = AuditApplicationApplyDeSerializer(data=request.data)
        application_apply_ds.is_valid(raise_exception=True)
        try:
            application = audit_service.apply(
                    application_apply_ds.data["audit_id"], 
                    application_apply_ds.data["location_id"], 
                    application_apply_ds.data["profileinfo_id"], 
                    application_apply_ds.data["audit_date"]
            )
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e

class AuditApplicationCancelView(APIView):
    def post(self, request, audit_id, location_id, format=None):
        data = {}
        data["audit_id"] = audit_id
        data["location_id"] = location_id
        data["profileinfo_id"] = ProfileInfo.objects.get(user_id=request.user.id).id

        application_cancel_ds = AuditApplicationCancelDeSerializer(data=data)
        application_cancel_ds.is_valid(raise_exception=True)
        try:
            application = audit_service.cancel(
                    application_cancel_ds.data["audit_id"], 
                    application_cancel_ds.data["location_id"], 
                    application_cancel_ds.data["profileinfo_id"]
            )
            return Response(AuditApplicationSerializer(application).data)
        except ObjectNotFound as e:
            raise NotFound from e
        except AppLogicError as e:
            raise ValidationError({
                "non_field_errors": [e.__str__()]
                }) from e


class CityView(APIView):
    def get(self, request, state, format=None):
        if state in states.states:
            cities = City.objects.filter(state=state)
            return Response(CitySerializer(cities, many=True).data)
        raise NotFound

class StateView(APIView):
    def get(self, request, format=None):
        return Response(states.states)

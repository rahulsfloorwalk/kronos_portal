from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import ProfileInfo, BankInfo, AdditionalInfo
from .forms import ProfileInfoForm, AdditionalInfoForm, BankInfoForm
from .serializers import ProfileInfoSerializer, AdditionalInfoSerializer, BankInfoSerializer

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
        return Response(profile_info)

class AdditionalInfoView(APIView):
    def get(self, request, format=None):
        try:
            additional_info = AdditionalInfo.objects.get(user_id=request.user.id)
            return Response(AdditionalInfoSerializer(additional_info).data)
        except AdditionalInfo.DoesNotExist:
            raise Http404

    def post(self, request):
        additional_info_s= AdditionalInfoSerializer(data=request.data)
        additional_info_s.is_valid(raise_exception=True)
        additional_info = additional_info_s.save(current_user=request.user)
        return Response(additional_info)


class BankInfoView(APIView):
    def get(self, request, format=None):
        try:
            bank_info = BankInfo.objects.get(user_id=request.user.id)
            return Response(BankInfoSerializer(bank_info).data)
        except BankInfo.DoesNotExist:
            raise Http404

    def post(self, request):
        bank_info_s = BankInfoSerializer(data=request.data)
        bank_info_s.is_valid(raise_exception=True)
        bank_info = bank_info_s.save(current_user=request.user)
        return Response(bank_info)

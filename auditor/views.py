from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    return HttpResponse("Welcome Shopper. Complete your profile infomation to be eligible for audit")

@login_required
def profile(request):
    return HttpResponse("Shopper profile")

@login_required
def profile_edit(request):
    return HttpResponse("Shopper edit details page")

@login_required
def profile_additional_edit(request):
    return HttpResponse("Shopper additional info edit page")

@login_required
def profile_bank_edit(request):
    return HttpResponse("Shopper additional info edit page")
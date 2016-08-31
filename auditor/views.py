from django.shortcuts import render
from django.http import HttpResponse

def dashboard(request):
    return HttpResponse("Welcome Shopper. Complete your profile infomation to be eligible for audit")

def profile(request):
    return HttpResponse("Shopper profile")

def details(request):
    return HttpResponse("Shopper details page")

def submit(request):
    return HttpResponse("View on submitting response")

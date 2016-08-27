from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout

def index(request):
    return HttpResponse("At hades index")

def signup(request):
    return HttpResponse("At signup")

def login_view(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    # if user is not None:
    # 	login(request, user)
    # 	#redirect to dashboard
    # else:
    # 	#redirect to invalid/login page
    return HttpResponse("At login view")

def logout_view(request):
	logout(request)
	#redirect to website page
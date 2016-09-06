from django import forms
from django.contrib.auth.models import User
from registration.models import Verification
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from auditor.models import ProfileInfo

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required = True)
    phone = forms.CharField(required = True)

    class Meta:
        model = User
        fields = ("username", "email", "phone", "password1", "password2")

    def save(self, commit = True):
        user = super(SignUpForm, self).save(commit = False)
        user.email = self.cleaned_data["email"]
        user.phone = self.cleaned_data["phone"]
        user.save()

        profile_info = ProfileInfo(user_id=user.id, mobile_number=user.phone)
        profile_info.save()

        auth_data = {}
        auth_data['username'] = self.cleaned_data['username']
        salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
        usernamesalt = auth_data['username']

        if not isinstance(usernamesalt, unicode):
            raise UnicodeError("generated usernamesalt is not unicode")

        usernamesalt = usernamesalt.encode('utf8')
        auth_data['activation_key'] = hashlib.sha1(salt+usernamesalt).hexdigest()
        auth_data['expiry'] = datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(days=2), "%Y-%m-%d %H:%M:%S")
        auth_data['email_path'] = "registration/password_reset_email.html"
        auth_data['email_subject'] = "registration/password_reset_subject.txt"

        verification = Verification()
        verification.user = user
        verification.activation_key = auth_data['activation_key']
        verification.key_expires = auth_data['expiry']
        verification.save()

        self.sendEmail(auth_data)

        return user

    def sendEmail(self, auth_data):
        print(auth_data['activation_key'])
        print(auth_data['expiry'])

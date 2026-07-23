from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """Authenticates using email + password instead of username + password.

    Kept separate from Django's default ModelBackend (which still handles
    username-based login for /admin/) so both work side by side.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get("email", username)
        if email is None or password is None:
            return None
        
        # Look up user case-insensitively, handle possible duplicates safely
        user = User.objects.filter(email__iexact=email).first()
        
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
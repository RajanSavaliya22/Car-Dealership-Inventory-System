from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only users with role=ADMIN may access this view, for any method."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_admin", False)
        )
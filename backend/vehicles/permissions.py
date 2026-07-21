from rest_framework.permissions import BasePermission

# TODO (Phase B): implement IsAdminOrReadOnly for the vehicle CRUD endpoints
# - Safe methods (GET) -> anyone authenticated
# - Write methods (POST/PUT/PATCH/DELETE) -> request.user.is_admin only

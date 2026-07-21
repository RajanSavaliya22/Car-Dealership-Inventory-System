from django.contrib.auth.models import AbstractUser
from django.db import models

# TODO (TDD step 1 - RED):
# Run `pytest accounts/tests/test_models.py` first — it will fail because
# `role` and the ADMIN/CUSTOMER choices don't exist yet.
# Then come back here and implement just enough to make it pass (GREEN),
# then refactor if needed.


class User(AbstractUser):
    """Custom user with a role distinguishing Admin vs Customer.
    """
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        CUSTOMER = "CUSTOMER", "Customer"
 
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
 
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
 
    def __str__(self):
        return self.email

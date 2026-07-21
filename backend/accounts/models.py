from django.contrib.auth.models import AbstractUser
from django.db import models

# TODO (TDD step 1 - RED):
# Run `pytest accounts/tests/test_models.py` first — it will fail because
# `role` and the ADMIN/CUSTOMER choices don't exist yet.
# Then come back here and implement just enough to make it pass (GREEN),
# then refactor if needed.


class User(AbstractUser):
    """Custom user with a role distinguishing Admin vs Customer.

    Intentionally left unfinished — add the `role` field (and any
    choices/constants) here to satisfy accounts/tests/test_models.py.
    """
    pass

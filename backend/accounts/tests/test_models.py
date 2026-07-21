import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_user_created_with_default_role_customer(self):
        user = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="testpass123",
        )
        assert user.role == User.Role.CUSTOMER

    def test_user_can_be_created_as_admin(self):
        admin = User.objects.create_user(
            username="admin_bob",
            email="bob@example.com",
            password="testpass123",
            role=User.Role.ADMIN,
        )
        assert admin.role == User.Role.ADMIN

    def test_is_admin_property_true_for_admin_role(self):
        admin = User.objects.create_user(
            username="admin_amy",
            email="amy@example.com",
            password="testpass123",
            role=User.Role.ADMIN,
        )
        assert admin.is_admin is True

    def test_is_admin_property_false_for_customer_role(self):
        customer = User.objects.create_user(
            username="cust_tom",
            email="tom@example.com",
            password="testpass123",
        )
        assert customer.is_admin is False

    def test_user_str_returns_email(self):
        user = User.objects.create_user(
            username="jane",
            email="jane@example.com",
            password="testpass123",
        )
        assert str(user) == "jane@example.com"

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRegisterView:
    url = "/api/auth/register/"

    def test_register_endpoint_creates_user(self, api_client):
        response = api_client.post(self.url, {
            "username": "jane",
            "email": "jane@example.com",
            "password": "strongpass123",
        })

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="jane@example.com").exists()

    def test_register_response_does_not_leak_password(self, api_client):
        response = api_client.post(self.url, {
            "username": "jane",
            "email": "jane@example.com",
            "password": "strongpass123",
        })

        assert "password" not in response.data

    def test_register_defaults_to_customer_role(self, api_client):
        api_client.post(self.url, {
            "username": "jane",
            "email": "jane@example.com",
            "password": "strongpass123",
        })

        user = User.objects.get(email="jane@example.com")
        assert user.role == User.Role.CUSTOMER

    def test_register_fails_with_duplicate_email(self, api_client):
        User.objects.create_user(
            username="existing", email="jane@example.com", password="pass12345"
        )

        response = api_client.post(self.url, {
            "username": "jane2",
            "email": "jane@example.com",
            "password": "strongpass123",
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_fails_with_short_password(self, api_client):
        response = api_client.post(self.url, {
            "username": "jane",
            "email": "jane@example.com",
            "password": "123",
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLoginView:
    url = "/api/auth/login/"

    def setup_method(self):
        self.password = "strongpass123"

    def test_login_returns_jwt_token(self, api_client):
        User.objects.create_user(
            username="jane", email="jane@example.com", password=self.password
        )

        response = api_client.post(self.url, {
            "email": "jane@example.com",
            "password": self.password,
        })

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_fails_with_wrong_password(self, api_client):
        User.objects.create_user(
            username="jane", email="jane@example.com", password=self.password
        )

        response = api_client.post(self.url, {
            "email": "jane@example.com",
            "password": "wrongpassword",
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_fails_with_unknown_email(self, api_client):
        response = api_client.post(self.url, {
            "email": "ghost@example.com",
            "password": "whatever123",
        })

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMeView:
    url = "/api/auth/me/"

    def test_protected_endpoint_rejects_unauthenticated_user(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_authenticated_user_can_fetch_own_profile(self, api_client):
        user = User.objects.create_user(
            username="jane", email="jane@example.com", password="strongpass123"
        )
        api_client.force_authenticate(user=user)

        response = api_client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "jane@example.com"
        assert response.data["role"] == User.Role.CUSTOMER
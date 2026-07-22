import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from vehicles.models import Vehicle

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin1", email="admin@example.com", password="pass12345",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def customer_user(db):
    return User.objects.create_user(
        username="cust1", email="cust@example.com", password="pass12345",
    )


@pytest.fixture
def sample_vehicles(db):
    return [
        Vehicle.objects.create(make="Toyota", model="Camry", year=2024, price="28999.99", quantity=5),
        Vehicle.objects.create(make="Honda", model="Civic", year=2023, price="24999.00", quantity=0),
        Vehicle.objects.create(make="Toyota", model="Corolla", year=2022, price="21999.00", quantity=2),
    ]


@pytest.mark.django_db
class TestVehicleListView:
    url = "/api/vehicles/"

    def test_list_vehicles_returns_all(self, api_client, customer_user, sample_vehicles):
        api_client.force_authenticate(user=customer_user)
        response = api_client.get(self.url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3

    def test_search_vehicles_by_make(self, api_client, customer_user, sample_vehicles):
        api_client.force_authenticate(user=customer_user)
        response = api_client.get(self.url, {"search": "Toyota"})

        makes = {v["make"] for v in response.data["results"]}
        assert makes == {"Toyota"}
        assert len(response.data["results"]) == 2

    def test_filter_vehicles_by_year(self, api_client, customer_user, sample_vehicles):
        api_client.force_authenticate(user=customer_user)
        response = api_client.get(self.url, {"year": 2023})

        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["model"] == "Civic"

    def test_filter_vehicles_by_price_range(self, api_client, customer_user, sample_vehicles):
        api_client.force_authenticate(user=customer_user)
        response = api_client.get(self.url, {"min_price": 22000, "max_price": 29000})

        models = {v["model"] for v in response.data["results"]}
        assert models == {"Camry", "Civic"}

    def test_zero_quantity_vehicle_reports_unavailable(self, api_client, customer_user, sample_vehicles):
        api_client.force_authenticate(user=customer_user)
        response = api_client.get(self.url, {"search": "Civic"})

        assert response.data["results"][0]["is_in_stock"] is False


@pytest.mark.django_db
class TestVehicleWritePermissions:
    url = "/api/vehicles/"
    payload = {
        "make": "Ford", "model": "Focus", "year": 2021, "price": "18999.00", "quantity": 4,
    }

    def test_admin_can_create_vehicle(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(self.url, self.payload)

        assert response.status_code == status.HTTP_201_CREATED
        assert Vehicle.objects.filter(model="Focus").exists()

    def test_customer_cannot_create_vehicle(self, api_client, customer_user):
        api_client.force_authenticate(user=customer_user)
        response = api_client.post(self.url, self.payload)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_update_vehicle(self, api_client, admin_user, sample_vehicles):
        vehicle = sample_vehicles[0]
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(f"{self.url}{vehicle.id}/", {"price": "26999.00"})

        assert response.status_code == status.HTTP_200_OK
        vehicle.refresh_from_db()
        assert str(vehicle.price) == "26999.00"

    def test_customer_cannot_update_vehicle(self, api_client, customer_user, sample_vehicles):
        vehicle = sample_vehicles[0]
        api_client.force_authenticate(user=customer_user)
        response = api_client.patch(f"{self.url}{vehicle.id}/", {"price": "1.00"})

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_delete_vehicle(self, api_client, admin_user, sample_vehicles):
        vehicle = sample_vehicles[0]
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f"{self.url}{vehicle.id}/")

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Vehicle.objects.filter(id=vehicle.id).exists()

    def test_customer_cannot_delete_vehicle(self, api_client, customer_user, sample_vehicles):
        vehicle = sample_vehicles[0]
        api_client.force_authenticate(user=customer_user)
        response = api_client.delete(f"{self.url}{vehicle.id}/")

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Vehicle.objects.filter(id=vehicle.id).exists()

    def test_unauthenticated_user_cannot_list_vehicles(self, api_client, sample_vehicles):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
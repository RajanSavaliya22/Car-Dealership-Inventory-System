import pytest
import threading
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db import connections, connection
from rest_framework.test import APIClient
from rest_framework import status
from vehicles.models import Vehicle
from transactions.models import Transaction

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin1", email="admin@example.com", password="pass12345", role=User.Role.ADMIN
    )


@pytest.fixture
def customer_user(db):
    return User.objects.create_user(username="cust1", email="cust@example.com", password="pass12345")


@pytest.fixture
def in_stock_vehicle(db):
    return Vehicle.objects.create(make="Toyota", model="Corolla", year=2023, price=Decimal("21000"), quantity=3)


@pytest.fixture
def out_of_stock_vehicle(db):
    return Vehicle.objects.create(make="Honda", model="Civic", year=2022, price=Decimal("19000"), quantity=0)


@pytest.mark.django_db
class TestPurchaseView:
    url = "/api/transactions/purchase/"

    def test_purchase_decrements_quantity_by_one(self, api_client, customer_user, in_stock_vehicle):
        api_client.force_authenticate(user=customer_user)

        response = api_client.post(self.url, {"vehicle": in_stock_vehicle.id})

        assert response.status_code == status.HTTP_201_CREATED
        in_stock_vehicle.refresh_from_db()
        assert in_stock_vehicle.quantity == 2

    def test_purchase_creates_transaction_record(self, api_client, customer_user, in_stock_vehicle):
        api_client.force_authenticate(user=customer_user)

        api_client.post(self.url, {"vehicle": in_stock_vehicle.id})

        txn = Transaction.objects.get(vehicle=in_stock_vehicle, user=customer_user)
        assert txn.transaction_type == Transaction.Type.PURCHASE
        assert txn.quantity == 1

    def test_purchase_fails_when_quantity_is_zero(self, api_client, customer_user, out_of_stock_vehicle):
        api_client.force_authenticate(user=customer_user)

        response = api_client.post(self.url, {"vehicle": out_of_stock_vehicle.id})

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        out_of_stock_vehicle.refresh_from_db()
        assert out_of_stock_vehicle.quantity == 0
        assert not Transaction.objects.filter(vehicle=out_of_stock_vehicle).exists()

    def test_purchase_requires_authentication(self, api_client, in_stock_vehicle):
        response = api_client.post(self.url, {"vehicle": in_stock_vehicle.id})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_purchase_fails_for_nonexistent_vehicle(self, api_client, customer_user):
        api_client.force_authenticate(user=customer_user)

        response = api_client.post(self.url, {"vehicle": 99999})

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestRestockView:
    url = "/api/transactions/restock/"

    def test_admin_can_restock_vehicle(self, api_client, admin_user, in_stock_vehicle):
        api_client.force_authenticate(user=admin_user)

        response = api_client.post(self.url, {"vehicle": in_stock_vehicle.id, "quantity": 5})

        assert response.status_code == status.HTTP_201_CREATED
        in_stock_vehicle.refresh_from_db()
        assert in_stock_vehicle.quantity == 8

    def test_restock_creates_transaction_record(self, api_client, admin_user, in_stock_vehicle):
        api_client.force_authenticate(user=admin_user)

        api_client.post(self.url, {"vehicle": in_stock_vehicle.id, "quantity": 5})

        txn = Transaction.objects.get(vehicle=in_stock_vehicle, user=admin_user)
        assert txn.transaction_type == Transaction.Type.RESTOCK
        assert txn.quantity == 5

    def test_non_admin_cannot_restock(self, api_client, customer_user, in_stock_vehicle):
        api_client.force_authenticate(user=customer_user)

        response = api_client.post(self.url, {"vehicle": in_stock_vehicle.id, "quantity": 5})

        assert response.status_code == status.HTTP_403_FORBIDDEN
        in_stock_vehicle.refresh_from_db()
        assert in_stock_vehicle.quantity == 3

    def test_restock_requires_positive_quantity(self, api_client, admin_user, in_stock_vehicle):
        api_client.force_authenticate(user=admin_user)

        response = api_client.post(self.url, {"vehicle": in_stock_vehicle.id, "quantity": 0})

        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db(transaction=True)
@pytest.mark.skipif(
    connection.vendor != "postgresql",
    reason=(
        "select_for_update() row-locking semantics require PostgreSQL. "
        "SQLite raises 'database is locked' under concurrent writers "
        "instead of serializing them, which isn't what this test checks."
    ),
)
class TestPurchaseConcurrency:
    """Two concurrent purchase requests against a single-unit vehicle should
    never both succeed - the DB row lock (select_for_update) in the view
    must serialize them so only one decrement happens."""

    def test_concurrent_purchases_do_not_oversell_last_unit(self, django_db_blocker):
        with django_db_blocker.unblock():
            vehicle = Vehicle.objects.create(
                make="Ford", model="Focus", year=2024, price=Decimal("22000"), quantity=1
            )
            user_a = User.objects.create_user(username="a", email="a@example.com", password="pass12345")
            user_b = User.objects.create_user(username="b", email="b@example.com", password="pass12345")

        results = []

        def attempt_purchase(user):
            client = APIClient()
            client.force_authenticate(user=user)
            response = client.post("/api/transactions/purchase/", {"vehicle": vehicle.id})
            results.append(response.status_code)
            connections.close_all()

        t1 = threading.Thread(target=attempt_purchase, args=(user_a,))
        t2 = threading.Thread(target=attempt_purchase, args=(user_b,))
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        with django_db_blocker.unblock():
            vehicle.refresh_from_db()
            assert vehicle.quantity == 0
            assert results.count(status.HTTP_201_CREATED) == 1
            assert results.count(status.HTTP_400_BAD_REQUEST) == 1
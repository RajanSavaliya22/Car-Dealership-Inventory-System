import threading
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import connection

from vehicles.models import Vehicle
from transactions.models import Transaction

User = get_user_model()


@pytest.fixture
def buyer(db):
    return User.objects.create_user(username="buyer", email="buyer@example.com", password="pass12345")


@pytest.fixture
def admin(db):
    return User.objects.create_user(
        username="admin", email="admin@example.com", password="pass12345", role=User.Role.ADMIN
    )


@pytest.fixture
def vehicle(db):
    return Vehicle.objects.create(
        make="Toyota", model="Corolla", year=2023, price=Decimal("21000.00"), quantity=3
    )


@pytest.mark.django_db
class TestTransactionModel:
    def test_purchase_decrements_vehicle_quantity(self, vehicle, buyer):
        Transaction.create_purchase(vehicle.id, buyer, quantity=1)

        vehicle.refresh_from_db()
        assert vehicle.quantity == 2

    def test_purchase_creates_transaction_record(self, vehicle, buyer):
        txn = Transaction.create_purchase(vehicle.id, buyer, quantity=1)

        assert txn.transaction_type == Transaction.Type.PURCHASE
        assert txn.vehicle_id == vehicle.id
        assert txn.user_id == buyer.id
        assert txn.quantity == 1

    def test_purchase_fails_when_quantity_requested_exceeds_stock(self, vehicle, buyer):
        with pytest.raises(ValidationError):
            Transaction.create_purchase(vehicle.id, buyer, quantity=10)

        vehicle.refresh_from_db()
        assert vehicle.quantity == 3  # unchanged

    def test_purchase_fails_when_vehicle_out_of_stock(self, buyer, db):
        out_of_stock = Vehicle.objects.create(
            make="Honda", model="Civic", year=2022, price=Decimal("19000.00"), quantity=0
        )
        with pytest.raises(ValidationError):
            Transaction.create_purchase(out_of_stock.id, buyer, quantity=1)

    def test_restock_increments_vehicle_quantity(self, vehicle, admin):
        Transaction.create_restock(vehicle.id, admin, quantity=5)

        vehicle.refresh_from_db()
        assert vehicle.quantity == 8

    def test_restock_creates_transaction_record(self, vehicle, admin):
        txn = Transaction.create_restock(vehicle.id, admin, quantity=5)

        assert txn.transaction_type == Transaction.Type.RESTOCK
        assert txn.quantity == 5

    def test_transaction_str_representation(self, vehicle, buyer):
        txn = Transaction.create_purchase(vehicle.id, buyer, quantity=1)

        assert str(txn) == f"PURCHASE x1 - {vehicle}"

    @pytest.mark.django_db(transaction=True)
    @pytest.mark.skipif(
        connection.vendor != "postgresql",
        reason=(
            "select_for_update() row-locking semantics require PostgreSQL. "
            "SQLite raises 'database is locked' under concurrent writers "
            "instead of serializing them, which isn't what this test is "
            "checking for."
        ),
    )
    def test_concurrent_purchases_do_not_oversell(self, buyer):
        contested_vehicle = Vehicle.objects.create(
            make="Ford", model="Focus", year=2024, price=Decimal("22000.00"), quantity=3
        )
        results = []

        def attempt_purchase():
            try:
                Transaction.create_purchase(contested_vehicle.id, buyer, quantity=1)
                results.append("success")
            except ValidationError:
                results.append("failed")
            finally:
                connection.close()

        threads = [threading.Thread(target=attempt_purchase) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        contested_vehicle.refresh_from_db()
        assert contested_vehicle.quantity == 0
        assert results.count("success") == 3
        assert results.count("failed") == 2
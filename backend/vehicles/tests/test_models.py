import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from vehicles.models import Vehicle


@pytest.mark.django_db
class TestVehicleModel:
    def make_vehicle(self, **overrides):
        defaults = dict(
            make="Toyota",
            model="Corolla",
            year=2023,
            price=Decimal("21000.00"),
            quantity=5,
            description="Reliable compact sedan.",
        )
        defaults.update(overrides)
        return Vehicle.objects.create(**defaults)

    def build_vehicle(self, **overrides):
        """Unsaved instance, for testing full_clean() validation directly."""
        defaults = dict(
            make="Toyota",
            model="Corolla",
            year=2023,
            price=Decimal("21000.00"),
            quantity=5,
            description="Reliable compact sedan.",
        )
        defaults.update(overrides)
        return Vehicle(**defaults)

    def test_vehicle_str_representation(self):
        vehicle = self.make_vehicle()
        assert str(vehicle) == "2023 Toyota Corolla"

    def test_vehicle_created_with_defaults(self):
        vehicle = self.make_vehicle()
        assert vehicle.quantity == 5
        assert vehicle.price == Decimal("21000.00")

    def test_vehicle_quantity_defaults_to_zero_when_not_provided(self):
        vehicle = Vehicle.objects.create(
            make="Honda", model="Civic", year=2022, price=Decimal("19000.00")
        )
        assert vehicle.quantity == 0

    def test_vehicle_quantity_cannot_be_negative(self):
        vehicle = self.build_vehicle(quantity=-1)
        with pytest.raises(ValidationError):
            vehicle.full_clean()

    def test_vehicle_price_cannot_be_negative(self):
        vehicle = self.build_vehicle(price=Decimal("-100.00"))
        with pytest.raises(ValidationError):
            vehicle.full_clean()

    def test_is_in_stock_true_when_quantity_positive(self):
        vehicle = self.make_vehicle(quantity=3)
        assert vehicle.is_in_stock is True

    def test_is_in_stock_false_when_quantity_zero(self):
        vehicle = self.make_vehicle(quantity=0)
        assert vehicle.is_in_stock is False
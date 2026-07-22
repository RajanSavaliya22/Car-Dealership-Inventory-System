from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db import transaction as db_transaction

from vehicles.models import Vehicle


class Transaction(models.Model):
    class Type(models.TextChoices):
        PURCHASE = "PURCHASE", "Purchase"
        RESTOCK = "RESTOCK", "Restock"

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="transactions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="transactions",
    )
    transaction_type = models.CharField(max_length=10, choices=Type.choices)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} x{self.quantity} - {self.vehicle}"

    @classmethod
    def create_purchase(cls, vehicle_id, user, quantity=1):
        with db_transaction.atomic():
            vehicle = Vehicle.objects.select_for_update().get(pk=vehicle_id)
            if vehicle.quantity < quantity:
                raise ValidationError(
                    "Not enough stock available to complete this purchase."
                )
            vehicle.quantity -= quantity
            vehicle.save(update_fields=["quantity", "updated_at"])
            return cls.objects.create(
                vehicle=vehicle,
                user=user,
                transaction_type=cls.Type.PURCHASE,
                quantity=quantity,
            )

    @classmethod
    def create_restock(cls, vehicle_id, user, quantity):
        with db_transaction.atomic():
            vehicle = Vehicle.objects.select_for_update().get(pk=vehicle_id)
            vehicle.quantity += quantity
            vehicle.save(update_fields=["quantity", "updated_at"])
            return cls.objects.create(
                vehicle=vehicle,
                user=user,
                transaction_type=cls.Type.RESTOCK,
                quantity=quantity,
            )
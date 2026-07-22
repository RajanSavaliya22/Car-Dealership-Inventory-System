from django.core.validators import MinValueValidator
from django.db import models


class Vehicle(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    quantity = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    description = models.TextField(blank=True, default="")
    image_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(quantity__gte=0),
                name="vehicle_quantity_non_negative",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

    @property
    def is_in_stock(self):
        return self.quantity > 0
from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    is_in_stock = serializers.BooleanField(read_only=True)
    image_url = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")

    class Meta:
        model = Vehicle
        fields = [
            "id", "make", "model", "year", "category", "price", "quantity",
            "description", "image_url", "is_in_stock",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
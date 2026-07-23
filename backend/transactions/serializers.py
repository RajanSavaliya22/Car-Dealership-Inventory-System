from rest_framework import serializers
from .models import Transaction


class PurchaseSerializer(serializers.Serializer):
    vehicle = serializers.IntegerField()
    quantity = serializers.IntegerField(required=False, default=1, min_value=1)


class RestockSerializer(serializers.Serializer):
    vehicle = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "vehicle", "user", "transaction_type", "quantity", "created_at"]
        read_only_fields = fields

class TransactionDetailSerializer(serializers.ModelSerializer):
    vehicle_make = serializers.CharField(source='vehicle.make', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id", "vehicle", "vehicle_make", "vehicle_model", 
            "user", "user_name", "user_email", 
            "transaction_type", "quantity", "created_at"
        ]
        read_only_fields = fields
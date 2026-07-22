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
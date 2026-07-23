from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from vehicles.models import Vehicle
from .models import Transaction
from .permissions import IsAdmin
from .serializers import PurchaseSerializer, RestockSerializer, TransactionSerializer, TransactionDetailSerializer


class TransactionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_admin:
            transactions = Transaction.objects.all()
        else:
            transactions = Transaction.objects.filter(user=request.user)
            
        serializer = TransactionDetailSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vehicle_id = serializer.validated_data["vehicle"]
        quantity = serializer.validated_data.get("quantity", 1)

        if not Vehicle.objects.filter(pk=vehicle_id).exists():
            return Response(
                {"detail": "Vehicle not found."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            txn = Transaction.create_purchase(vehicle_id, request.user, quantity=quantity)
        except DjangoValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TransactionSerializer(txn).data, status=status.HTTP_201_CREATED)


class RestockView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = RestockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vehicle_id = serializer.validated_data["vehicle"]
        quantity = serializer.validated_data["quantity"]

        if not Vehicle.objects.filter(pk=vehicle_id).exists():
            return Response(
                {"detail": "Vehicle not found."}, status=status.HTTP_400_BAD_REQUEST
            )

        txn = Transaction.create_restock(vehicle_id, request.user, quantity=quantity)
        return Response(TransactionSerializer(txn).data, status=status.HTTP_201_CREATED)
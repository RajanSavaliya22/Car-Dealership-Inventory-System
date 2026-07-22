from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicle
from .serializers import VehicleSerializer
from .permissions import IsAdminOrReadOnly
from .filters import VehicleFilter


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = VehicleFilter
    search_fields = ["make", "model", "description"]
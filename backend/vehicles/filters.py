import django_filters
from .models import Vehicle


class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Vehicle
        fields = ["make", "year", "min_price", "max_price"]
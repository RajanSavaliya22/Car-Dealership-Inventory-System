from django.urls import path
from .views import PurchaseView, RestockView, TransactionListView

urlpatterns = [
    path("purchase/", PurchaseView.as_view(), name="purchase"),
    path("restock/", RestockView.as_view(), name="restock"),
    path("", TransactionListView.as_view(), name="list"),
]
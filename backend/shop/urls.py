from django.urls import path

from .views import OrderCreateView, ProductDetailView, ProductListView, health_check

urlpatterns = [
    path("health", health_check, name="health-check"),
    path("products", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>", ProductDetailView.as_view(), name="product-detail"),
    path("orders", OrderCreateView.as_view(), name="order-create"),
]

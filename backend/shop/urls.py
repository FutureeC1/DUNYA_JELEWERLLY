from django.urls import path
from . import views
from .health import health_check

urlpatterns = [
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('orders/', views.OrderCreateView.as_view(), name='order-create'),
    path('health', health_check, name='health-check'),
]

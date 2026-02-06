from django.http import JsonResponse
from django.views import View
from django.db import connection
from rest_framework import generics
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer

class HealthCheckView(View):
    def get(self, request):
        return JsonResponse({
            "status": "healthy",
            "service": "dunya-jewellery-backend",
            "version": "1.0.0"
        }, status=200)

def db_check(request):
    """Temporary endpoint for database verification - remove after confirming PostgreSQL"""
    return JsonResponse({
        "vendor": connection.vendor,
        "name": connection.settings_dict.get("NAME"),
        "host": connection.settings_dict.get("HOST"),
        "engine": connection.settings_dict.get("ENGINE"),
    })

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

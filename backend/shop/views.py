from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Product
from .serializers import OrderCreateSerializer, ProductDetailSerializer, ProductListSerializer


@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok"})


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(in_stock=True)
    serializer_class = ProductListSerializer


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(in_stock=True)
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {"id": str(order.id), "status": order.status},
            status=status.HTTP_201_CREATED,
        )

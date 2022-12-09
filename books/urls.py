from .views import BookView, apiOverview, bookDetail, bookList
from django.urls import path

urlpatterns = [
    path('', BookView.as_view()),
    path('api/', apiOverview),
    path('api/books/', bookList),
    path('api/books/<str:pk>/', bookDetail),
]
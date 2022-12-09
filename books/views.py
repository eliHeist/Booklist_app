from django.views.decorators import csrf
from .models import Book
from django.shortcuts import render
from django.views.generic import TemplateView

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import BookSerializer
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
class BookView(TemplateView):
    template_name = 'books/index.html'


@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'list': '/books/',
        'detail': '/book/<str:pk>'
    }
    return Response(api_urls)


@api_view(['GET', 'POST'])
@csrf_exempt
def bookList(request):
    # get all books
    if request.method == 'GET':
        books = Book.objects.all()
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    # add a book
    if request.method == 'POST':
        data = request.data
        book = Book.objects.create(
            title = data.get('title'),
            isbn = data.get('isbn'),
            authour = data.get('authour')
        )
        serializer = BookSerializer(book, many=False)
        return Response(serializer.data)


@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def bookDetail(request, pk):
    # get 1 book
    if request.method == 'GET':
        book = Book.objects.get(isbn=pk)
        serializer = BookSerializer(book, many=False)
        return Response(serializer.data)

    # delete a book
    if request.method == 'DELETE':
        book = Book.objects.get(isbn=pk)
        book.delete()
        return Response(f'Deleted')
    
    # update a book
    if request.method == 'PUT':
        data = request.data
        book = Book.objects.get(isbn=pk)
        serializer = BookSerializer(instance=book, data=data)

        if serializer.is_valid():
            serializer.save()
        
        return Response(serializer.data)
        
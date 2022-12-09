from django.db import models

# Create your models here.
class Book(models.Model):
    isbn = models.IntegerField(unique=True, primary_key=True)
    title = models.CharField(max_length=100)
    authour = models.CharField(max_length=30)

    def __str__(self):
        return self.title
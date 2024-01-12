from django.urls import path
from .views import update_costs, commit_data
from . import views

urlpatterns = [
    path('contract_admin/', views.contract_admin, name='contract_admin'),
    path('upload_csv/', views.upload_csv, name='upload_csv'),
    path('update_costs/', update_costs, name='update_costs'),
    path('commit_data/', commit_data, name='commit_data')  # New URL pattern for AJAX request
]
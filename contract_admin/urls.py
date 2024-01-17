from django.urls import path
from .views import update_costs, commit_data
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('contract_admin/', views.contract_admin, name='contract_admin'),
    path('upload_csv/', views.upload_csv, name='upload_csv'),
    path('upload_categories/', views.upload_categories, name='upload_categories'),
    path('update_costs/', update_costs, name='update_costs'),
    path('commit_data/', commit_data, name='commit_data'), # New URL pattern for AJAX request,
    path('update-costing/', views.update_costing, name='update-costing'),
    path('delete_quote/', views.delete_quote, name='delete_quote'),
    path('update_quote/', views.update_quote, name='update_quote'),    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
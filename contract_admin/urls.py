from django.urls import path
from .views import update_costs, commit_data, commit_claim_data, update_costs, update_complete_on_site, delete_quote, update_quote, login
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
    path('update_complete_on_site/', views.update_complete_on_site, name='update_complete_on_site'),
    path('delete_quote/', views.delete_quote, name='delete_quote'),
    path('update_quote/', views.update_quote, name='update_quote'),
    path('commit_claim_data/', views.commit_claim_data, name='commit_claim_data'),        
    path('commit_hc_claim/', views.commit_hc_claim, name='commit_hc_claim'),    
    path('login/', views.login, name='login'),            
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
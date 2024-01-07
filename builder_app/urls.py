from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from contract_admin import views as contract_views

urlpatterns = [
    # path('', include('contract_admin.urls')),
    path('', contract_views.contract_admin, name='root'),
    path('contract_admin/', include('contract_admin.urls')),
    path('admin/', admin.site.urls),
]

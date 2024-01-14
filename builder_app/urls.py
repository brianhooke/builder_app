from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
from contract_admin import views as contract_views
from django.conf import settings



urlpatterns = [
    # path('', include('contract_admin.urls')),
    path('', contract_views.contract_admin, name='root'),
    path('contract_admin/', include('contract_admin.urls')),
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
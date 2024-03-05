# settings/production.py
import os
from .base import *

DEBUG = True

# AWS S3 Settings
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'builderappbucket'
AWS_S3_CUSTOM_DOMAIN = f'builderappbucket.s3.amazonaws.com'
AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
AWS_STATIC_LOCATION = 'static'
STATIC_URL = f'https://builderappbucket.s3.amazonaws.com/static/'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_PUBLIC_MEDIA_LOCATION = 'media/public'
DEFAULT_FILE_STORAGE = 'builderappbucket.storage_backends.MyS3Boto3Storage'
AWS_S3_REGION_NAME = 'us-east-1'
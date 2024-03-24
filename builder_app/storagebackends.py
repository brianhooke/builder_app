from storages.backends.s3boto3 import S3Boto3Storage

class MyS3Boto3Storage(S3Boto3Storage):
    @property
    def object_parameters(self):
        return {}
    
class StaticStorage(S3Boto3Storage):
    location = 'static'
    default_acl = 'public-read'

class PublicMediaStorage(S3Boto3Storage):
    location = 'media/public'
    default_acl = 'public-read'
    file_overwrite = False

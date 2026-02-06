import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

print("WSGI LOADED OK")

from django.db import connection
print("DB vendor:", connection.vendor)
print("DB name:", connection.settings_dict.get("NAME"))

application = get_wsgi_application()

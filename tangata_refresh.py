# This script is intended to run in a local DBT environment, to create fresh dbt docs and upload to a Tangata server.
# It is designed to be executed in the root folder of your dbt environment.
# Prerequisites: pip install requests

import os
import requests
import json

os.system("dbt docs generate")
server = str(input("Enter Tangata server for upload: (default: https://tangata.chrisjenkins.nz) ") or "https://tangata.chrisjenkins.nz")
useremail = input("Enter Tangata Email: ")
userpassword = input("Enter Tangata Password: ")
print(server)

loginbody = {"user": {"email": useremail, "password": userpassword}}
userresponsejson = requests.post(server + "/api/v1/users/login", json=loginbody ).json()
catalogjson = {"file": open('target/catalog.json','rb')}
catalogjsonresponse = requests.post(server + "/api/v1/file_upload", files=catalogjson, headers= {'UploadType': 'CatalogJSON', 'Authorization': "Token " + userresponsejson['user']['token']})
manifestjson = {"file": open('target/manifest.json','rb')}
manifestjsonresponse = requests.post(server + "/api/v1/file_upload", files=manifestjson, headers= {'UploadType': 'ManifestJSON', 'Authorization': "Token " + userresponsejson['user']['token']})

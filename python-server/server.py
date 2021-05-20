from flask import (Flask, render_template, request)
import os
import tangata_api

dbtpath = '../api/user_folders/608d43419957386b24b565d4/dbt/'
app = Flask("__main__", template_folder='../front-end/build/', static_folder='../front-end/build/static/')

@app.route("/")
def my_index():
    return render_template('index.html', flask_token="Hello world")

@app.route("/api/v1/model_search/<searchString>")
def serve_search(searchString):
    print("search received")
    return tangata_api.searchModels(searchString)

@app.route("/api/v1/models/<nodeID>")
def get_model(nodeID):
    print("get model")
    return tangata_api.get_model(nodeID)

@app.route("/api/v1/update_metadata", methods=['POST'])
def update_metadata():
    print("post metadata update")
    return tangata_api.update_metadata(request.json)


app.run(debug=True, port=8080)
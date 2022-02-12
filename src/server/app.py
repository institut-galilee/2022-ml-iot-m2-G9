from copy import copy
from crypt import methods
from telnetlib import STATUS
from flask import Flask, request, make_response, jsonify
import uuid
import json
from flask_cors import CORS


users = [
    {
        'NE': '11931512',
        'name': 'Rami ALZEBAK',
        'img': 'static/images/rami.jpeg',
        'password': '12345678'
    }
]

sessions = []

events = []


app = Flask(__name__)
CORS(app)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


def find_user(id):
    for user in users:
        if user['NE'] == id:
            return user

    return None


def find_session(id):
    for session in sessions:
        if session['id'] == id:
            return session

    return None


@app.route('/register/<session_id>', methods=['POST'])
def register(session_id):
    body = request.get_json()

    return make_response('OK', 200)


@app.route('/login', methods=['POST'])
def login():
    body = request.get_json()
    user = find_user(body['NE'])
    if user is None:
        return make_response("username or password is incorrect", 401)

    if user['password'] != body['password']:
        return make_response("username or password is incorrect", 401)

    session = copy(user)
    del session['password']
    session['id'] = str(uuid.uuid4())[:8]
    session['img'] = request.host_url + user['img']
    session['NE'] = user['NE']
    session['started'] = False
    session['camera_in_view'] = False
    sessions.append(session)

    return make_response(jsonify(session), 200)


@app.route('/start/<session_id>' , methods=['POST'])
def start(session_id):

    session = find_session(session_id)

    if session is None or session['camera_in_view'] == False:
        return make_response('Camera not in view', 200)

    session['started'] = True
    return make_response('OK', 200)

from copy import copy
from crypt import methods
import datetime
from telnetlib import STATUS
from flask import Flask, request, make_response, jsonify
import uuid
import json
from flask_cors import CORS
import base64


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


@app.route('/sessions/', methods=['GET'])
def getSessions():
    return make_response(jsonify(sessions), 200)


@app.route('/events/<session_id>', methods=['GET'])
def getEvents(session_id):
    return make_response(jsonify(filter(lambda x: x['session_id'] == session_id, events)), 200)


@app.route('/register/<session_id>', methods=['POST'])
def register(session_id):
    body = request.get_json()
    session = find_session(session_id)

    if session is None:
        return make_response('Session not found', 404)

    if session['ended'] == True or session['started'] == False: #ignore events if the session has ended or has not yet started 
        return make_response('OK', 200)


    body["session_id"] = session_id
    if 'photo' in body.keys():
        photo = body['photo'][22:]
        imagePath = "static/generated/image-{0}-{1}.jpg".format(
            session_id, len(events))

        with open(imagePath, "wb") as fh:
            fh.write(base64.urlsafe_b64decode(photo))
        del body["photo"]
        body["image"] = request.host_url + imagePath

    body["time"] = datetime.datetime.now()
    events.append(body)
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
    session['screen-in-view'] = False
    session['start-date'] = None
    session['end-date'] = None
    session['ended'] = False
    session['camera-view'] = False
    sessions.append(session)

    return make_response(jsonify(session), 200)


@app.route('/start/<session_id>', methods=['POST'])
def start(session_id):

    session = find_session(session_id)

    if session is None or session['screen-in-view'] == False:
        return make_response('Screen is not in view', 400)

    session['started'] = True
    session['start-date'] = datetime.datetime.now()
    return make_response('OK', 200)


@app.route('/end/<session_id>', methods=['POST'])
def end(session_id):

    session = find_session(session_id)

    if session is None:
        return make_response('Session not found', 404)

    session['ended'] = True
    session['end-date'] = datetime.datetime.now()
    return make_response('OK', 200)


@app.route('/connect/<session_id>', methods=['POST'])
def connect(session_id):

    session = find_session(session_id)

    if session is None:
        return make_response('Session not found', 404)

    session['camera-view'] = True

    return make_response(jsonify(session), 200)


@app.route('/update-screen-in-view/<session_id>', methods=['POST'])
def updateScreenInView(session_id):

    body = request.get_json()

    session = find_session(session_id)

    if session is None:
        return make_response('Session not found', 404)

    session['screen-in-view'] = body['isScreenInView']
    return make_response('OK', 200)


@app.route('/started/<session_id>', methods=['GET'])
def started(session_id):

    session = find_session(session_id)

    if session is None:
        return make_response('Session not found', 404)

    return make_response(jsonify({'started':  session['started']}), 200)

"""
views.py
IPM Demo for Dell

Routes go here.

Author: Peter Tan
"""
import json
from app import app, db
from app.models import IPMUser
from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, \
    TWILIO_IPM_SERVICE_SID, TWILIO_API_KEY, \
    TWILIO_API_SECRET, TWILIO_NUMBER
from flask import render_template, flash, url_for, request, redirect, jsonify
from twilio import twiml
from twilio.access_token import AccessToken, IpMessagingGrant
from twilio.rest import TwilioRestClient
from twilio.rest.ip_messaging import TwilioIpMessagingClient

__author__ = 'ptan'


### Error Pages and Index Pages
@app.errorhandler(404)
def internal_error(error):
    """Error page for 404."""
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """Error page for 500."""
    return render_template('500.html'), 500


### The IP Messaging Section
### Database helper functions
def new_user(from_number, channel_sid, user_sid):
    """This creates a new user inside the SQLlite Database"""
    user = IPMUser(phone_number=from_number,
                   channel_sid=channel_sid,
                   user_sid=user_sid)
    db.session.add(user)
    db.session.commit()
    return None


def remove_user(identity):
    """This deletes a specified user inside the SQLlite Database"""
    IPMUser.query.filter_by(phone_number=identity).delete()
    db.session.commit()
    return None

@app.route('/', methods=['GET', 'POST'])
@app.route('/ipm', methods=['GET', 'POST'])
def ipm():
    return render_template('ipm.html', title="IP Messaging Demo",
                           ipm_number=TWILIO_NUMBER)


@app.route('/token')
def token():
    # Hard-coded username of BrowserUser for the client
    """
    Helper function to return a token to the front-end JS IPM client.
    """
    identity = "BrowserUser"

    # Create a unique endpoint ID for the client
    device_id = request.args.get('device')
    endpoint = "TwilioChatDemo:{0}:{1}".format(identity, device_id)

    # Create access token with credentials
    token = AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET,
                        identity)

    # Create an IP Messaging grant and add to token
    ipm_grant = IpMessagingGrant(endpoint_id=endpoint,
                                 service_sid=TWILIO_IPM_SERVICE_SID)
    token.add_grant(ipm_grant)

    # Return token info as JSON
    return jsonify(identity=identity, token=token.to_jwt())


@app.route('/inbound_chat', methods=['GET', 'POST'])
def inbound_chat():
    """
    Receives inbound messages and creates/updates an IPM channel as needed.
    """
    # Get request values
    from_number = request.values.get('From').strip("+")
    body = request.values.get('Body')
    client = TwilioIpMessagingClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    service = client.services.get(TWILIO_IPM_SERVICE_SID)

    db_user = IPMUser.query.filter_by(phone_number=from_number).first()
    try:
        print(db_user, db_user.phone_number, db_user.channel_sid,
              db_user.user_sid)
    except:
        print("Record not found")

    # If User Exists, update their Channel, else make a new one.
    if type(db_user) is None or db_user is None:
        user = service.users.create(identity=from_number)
        channel = service.channels.create(friendly_name=from_number,
                                          unique_name=from_number)
        member = channel.members.create(identity=user.identity)
        member2 = channel.members.create(identity="BrowserUser")
        messages = channel.messages.create(body=body, from_=user.identity)
        new_user(from_number, channel.sid, user.sid)
    else:
        user = service.users.get(db_user.user_sid)
        channel = service.channels.get(sid=db_user.channel_sid)
        messages = channel.messages.create(body=body, from_=user.identity)

    resp = twiml.Response()
    return str(resp)


@app.route('/outbound_message', methods=['POST'])
def outbound_message():
    """
    Forwards chats made on the browser as an SMS back to the person.
    """
    message = request.form.get('message')
    e164_number = "+" + request.form.get('phone_number')
    client = TwilioRestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    messages = client.messages.create(from_=TWILIO_NUMBER, to=e164_number,
                                      body=message)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


@app.route('/ipm_channel_delete_all', methods=['GET', 'POST'])
def ipm_channel_delete_all():
    """
    Deletes all IPM channels in the service and refreshes the page.
    """
    client = TwilioIpMessagingClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    service = client.services.get(TWILIO_IPM_SERVICE_SID)
    channels = service.channels.list()
    users = service.users.list()
    for user in users:
        remove_user(user.identity)
        response = user.delete()
    for channel in channels:
        response = channel.delete()
    return redirect('ipm')
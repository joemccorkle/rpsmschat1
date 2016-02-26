"""
config.py
IPM Demo for Dell

The config file that contains all the environmental variables and credentials
for use throughout the app.

Author: Peter Tan
"""
import os

__author__ = 'ptan'

# Flask Security
CSRF_ENABLED = True
SECRET_KEY = 'you-will-never-guess'

# Twilio Master Credentials
TWILIO_ACCOUNT_SID = os.environ['TWILIO_ACCOUNT_SID']
TWILIO_AUTH_TOKEN = os.environ['TWILIO_AUTH_TOKEN']

# Twilio Phone Number
TWILIO_NUMBER = os.environ['TWILIO_NUMBER']

# Twilio IP Messaging Credentials
TWILIO_API_KEY = os.environ['TWILIO_API_KEY']
TWILIO_API_SECRET = os.environ['TWILIO_API_SECRET']
TWILIO_IPM_SERVICE_SID = os.environ['TWILIO_IPM_SERVICE_SID']


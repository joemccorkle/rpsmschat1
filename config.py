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

basedir = os.path.abspath(os.path.dirname(__file__))
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_DATABASE_URI = 'postgres://jakigihvpfvuon:f-Rjo0Ljw1vLBu1tdMLqj-nJ1X@ec2-54-83-202-218.compute-1.amazonaws.com:5432/da3cp9a4fcb0pk'
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')
SQLALCHEMY_TRACK_MODIFICATIONS = False
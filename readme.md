# Twilio IP Messaging Demo for Dell

## How to set up
First ensure that you have environmental variables configured for the list below:
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_NUMBER
TWILIO_API_KEY
TWILIO_API_SECRET
TWILIO_IPM_SERVICE_SID

## How to run
The is a virtual environment set up with all the pre-requisites installed. 
Use your command line and navigate to the directory and run these:
$source venv/bin/activate
$python server.py

## Pushing to Heroku
This repository is ready to be pushed to Heroku, you just need to go into git and
set the remote location to push to
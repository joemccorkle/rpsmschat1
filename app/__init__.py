"""
__init__.py
IPM Demo for Dell

Spin up the demo

Author: Peter Tan
"""
__author__ = 'ptan'

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)

from app import views, models

"""
models.py
IPM Demo for Dell

Database models go here.

Author: Peter Tan
"""
__author__ = 'ptan'

from app import db


class IPMUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(15), index=True, unique=True)
    channel_sid = db.Column(db.String(64), index=True, unique=True)
    user_sid = db.Column(db.String(64), index=True, unique=True)

    def __repr__(self):
        return '<Channel %r>' % (self.channel_sid)

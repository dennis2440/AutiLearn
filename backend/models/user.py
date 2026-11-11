from datetime import datetime

from db import db


class User(db.Model):
    """Adult accounts only. Children are `Learner` profiles owned by a guardian."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(190), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("guardian", "tutor", name="user_role"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {"id": self.id, "full_name": self.full_name, "email": self.email, "role": self.role}

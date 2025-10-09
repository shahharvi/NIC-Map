from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Users Tablezs
class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


# Search History
# Search History (1 search = many results)
class SearchHistory(db.Model):
    __tablename__ = "search_history"
    search_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"))
    query = db.Column(db.Text, nullable=False)
    searched_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    results = db.relationship("SearchResult", backref="search_history", cascade="all, delete-orphan")


# Search Results (linked to SearchHistory)
class SearchResult(db.Model):
    __tablename__ = "search_results"
    result_id = db.Column(db.Integer, primary_key=True)
    search_id = db.Column(db.Integer, db.ForeignKey("search_history.search_id", ondelete="CASCADE"))
    result_code = db.Column(db.String(20), nullable=False)
    result_description = db.Column(db.Text, nullable=False)



# Contact Messages
class ContactMessage(db.Model):
    __tablename__ = "contact_messages"
    message_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

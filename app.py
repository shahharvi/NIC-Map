from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
import re
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text
import os
from dotenv import load_dotenv
from sementic_search import semantic_search
from config import Config
from flask_dance.contrib.google import make_google_blueprint, google
import secrets
from models import db, User, ContactMessage, SearchHistory, SearchResult
import traceback
from functools import lru_cache


app = Flask(__name__)
app.config.from_object(Config)



# DB + Migrate
db.init_app(app)
migrate = Migrate(app, db)


# ✅ DB Connection Test - Only run once at startup
def test_db_connection():
    try:
        with app.app_context():
            with db.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# Test connection once at startup
test_db_connection()

# ---------- Password validation helper ----------
@lru_cache(maxsize=128)
def is_strong_password(password: str) -> bool:
    if not password or len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):  # special character
        return False
    return True

# home route
@app.route("/")
def home():
    return render_template("index.html")


# register route
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        try:
            name = request.form.get("name", "").strip()
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")
            confirm_password = request.form.get("confirmpassword", "")

            # Basic validation
            if not (name and email and password and confirm_password):
                flash("All fields are required!", "danger")
                return render_template("register.html")

            # Password confirmation
            if password != confirm_password:
                flash("Passwords do not match!", "danger")
                return render_template("register.html")

            # Password strength validation function
            # Helper function for password validation
            def is_strong_password(password):
                # At least 8 characters, with uppercase, lowercase, and special symbol
                if len(password) < 8:
                    return False
                if not any(c.isupper() for c in password):
                    return False
                if not any(c.islower() for c in password):
                    return False
                if not any(not c.isalnum() for c in password):
                    return False
                return True

            # Password strength
            if not is_strong_password(password):
                flash("Password must be at least 8 characters, include uppercase, lowercase, and a special symbol.", "danger")
                return render_template("register.html")

            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                flash("Email already registered. Please log in.", "danger")
                return render_template("register.html")

            # Create new user
            new_user = User(name=name, email=email)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()

            # Auto-login after registration
            session["user_id"] = new_user.user_id
            session["user_name"] = new_user.name
            session["user_email"] = new_user.email
            flash("Registration successful! Welcome to NIC Map.", "success")
            
            # Check if the user is an admin and redirect accordingly
            if new_user.email.lower() == "admin@nicmap.com":
                session["role"] = "admin"
                return redirect(url_for("admin_dashboard"))
            
            return redirect(url_for("home"))

        except Exception as e:
            db.session.rollback()
            flash(f"Registration failed: {str(e)}", "danger")
            return render_template("register.html")

    return render_template("register.html")

# ---------- OAuth (Google) ----------
if os.getenv("GOOGLE_CLIENT_ID") and os.getenv("GOOGLE_CLIENT_SECRET"):
    google_bp = make_google_blueprint(
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scope=["profile", "email"],
        redirect_to="google_post_login",
    )
    app.register_blueprint(google_bp, url_prefix="/login")

@app.route("/google/post_login")
def google_post_login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        flash("Google login failed. Please try again.", "danger")
        return redirect(url_for("login"))
    data = resp.json() or {}
    email = (data.get("email") or "").lower().strip()
    name = (data.get("name") or data.get("given_name") or "User").strip() or "User"
    if not email:
        flash("Google did not return an email address.", "danger")
        return redirect(url_for("login"))

    user = User.query.filter_by(email=email).first()
    if not user:
        # Create user with a random password to satisfy NOT NULL constraint
        user = User(name=name, email=email)
        user.set_password(secrets.token_urlsafe(24))
        db.session.add(user)
        db.session.commit()

    session["user_id"] = user.user_id
    session["user_name"] = user.name
    session["user_email"] = user.email
    flash("Logged in with Google!", "success")
    # Admin routing if needed
    if user.email.lower() == "admin@nicmap.com":
        session["role"] = "admin"
        return redirect(url_for("admin_dashboard"))
    return redirect(url_for("home"))

# login route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        # Basic validation
        if not (email and password):
            flash("Email and password are required!", "danger")
            return render_template("login.html")

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session["user_id"] = user.user_id
            session["user_name"] = user.name
            session["user_email"] = user.email
            flash("Login successful!", "success")
            # Redirect admin to admin dashboard
            if user.email.lower() == "admin@nicmap.com":
                session["role"] = "admin"
                return redirect(url_for("admin_dashboard"))
            return redirect(url_for("home"))

        flash("Invalid email or password.", "danger")
        return render_template("login.html")
    
    return render_template("login.html")


# logout route
@app.route("/logout")
def logout():
    session.clear()
    flash("Logged out successfully!", "info")
    return redirect(url_for("home"))


# ---------- Account APIs ----------
@app.route('/api/change_password', methods=['POST'])
def api_change_password():
    if not session.get('user_id'):
        return jsonify({"success": False, "error": "Not authenticated"}), 401

    data = request.get_json(silent=True) or {}
    old_password = data.get('old_password') or ''
    new_password = data.get('new_password') or ''
    confirm_password = data.get('confirm_password') or ''

    if not (old_password and new_password and confirm_password):
        return jsonify({"success": False, "error": "All fields are required"}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "error": "New passwords do not match"}), 400

    if not is_strong_password(new_password):
        return jsonify({
            "success": False,
            "error": "Password must be at least 8 chars with uppercase, lowercase, and a special symbol."
        }), 400

    user = User.query.get(session['user_id'])
    if not user or not user.check_password(old_password):
        return jsonify({"success": False, "error": "Old password is incorrect"}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"success": True, "message": "Password changed successfully"})



# search route
@app.route("/search")
def search():
    if "user_id" not in session:
        flash("Please log in to search .", "warning")
        return redirect(url_for("login"))
    return render_template("search.html")

# about-us route
@app.route("/about")
def about():
    return render_template("about.html")


# contact-us route
@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        subject = request.form.get("subject", "").strip()
        message = request.form.get("message", "").strip()

        if not (name and email and subject and message):
            flash("All fields are required.", "warning")
            return redirect(url_for("contact"))

        new_msg = ContactMessage(
            name=name, email=email, subject=subject, message=message
        )
        db.session.add(new_msg)
        db.session.commit()
        flash("Message sent successfully!", "success")
        return redirect(url_for("contact"))

    return render_template("contact.html")


# ---------- APIs ----------
# search api
@app.route("/api/search", methods=["POST"])
def api_search():
    data = request.get_json(silent=True) or {}
    business_description = (data.get("description") or "").strip()

    if not business_description:
        return jsonify({"success": False, "error": "No description provided"}), 400

    results = semantic_search(business_description, top_k=5)

    # (Optional) Save history + results if user is logged in
    if "user_id" in session:
        history = SearchHistory(user_id=session["user_id"], query=business_description)
        db.session.add(history)
        db.session.flush()  # get search_id

        # Batch insert all results at once
        search_results = []
        for r in results:
            # Try all possible keys for code/description
            code = r.get("nic_code") or r.get("result_code") or r.get("code") or ""
            desc = r.get("nic_description") or r.get("result_description") or r.get("description") or ""
            # Only save if both code and description are present
            if code and desc:
                search_results.append(
                    SearchResult(
                        search_id=history.search_id,
                        result_code=code,
                        result_description=desc
                    )
                )
        
        # Single bulk insert
        if search_results:
            db.session.add_all(search_results)
        db.session.commit()

    return jsonify({"success": True, "results": results, "query": business_description})


# chatbot route
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"success": False, "response": "Please type your business description to get NIC codes."})

    # Always perform FAISS-backed search for the user's free-form description
    try:
        results = semantic_search(message, top_k=5)
        if results:
            response_lines = ["Here are 5 most relevant NIC codes:"]
            for r in results:
                code = r.get("code") or r.get("nic_code") or r.get("result_code") or "—"
                desc = r.get("description") or r.get("nic_description") or r.get("result_description") or "Description unavailable"
                score_val = r.get("confidence") or r.get("score")
                score_txt = f" ({float(score_val)*100:.1f}% match)" if score_val is not None else ""
                response_lines.append(f"- {code}: {desc}{score_txt}")
            response = "\n".join(response_lines)
        else:
            response = (
                "I couldn't find matching NIC codes. Try adding more specifics (e.g., products or process)."
            )
    except Exception as e:
        response = f"⚠️ Error while searching NIC codes: {str(e)}"

    return jsonify({"success": True, "response": response})

@app.route("/api/feedback", methods=["POST"])
def feedback():
    data = request.get_json(silent=True) or {}
    code = data.get("code")
    fb = data.get("feedback")
    # TODO: Persist feedback if needed
    return jsonify({"success": True})



# ---------- Admin Routes ----------
# Admin dashboard
from functools import wraps

# Admin-only decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id') or session.get('role') != 'admin':
            flash('You must be logged in as admin to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin_dashboard')
@admin_required
def admin_dashboard():
    # Get real stats from database
    total_users = User.query.count()
    # Fix: Use db.session.query to count search history records
    total_searches = db.session.query(db.func.count(SearchHistory.search_id)).scalar()
    
    # Get top search queries
    # Fix: Use search_query instead of query to avoid conflict with the model attribute
    top_queries = db.session.query(
        SearchHistory.query.label('search_query'), 
        db.func.count(SearchHistory.search_id).label('count')
    ).group_by(SearchHistory.query).order_by(db.text('count DESC')).limit(5).all()
    
    # Get feedback messages
    feedback_messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(10).all()
    
    return render_template(
        "admin_dashboard.html",
        total_users=total_users,
        total_searches=total_searches,
        top_queries=top_queries,
        feedback_messages=feedback_messages
    )

# Admin Feedback Management
@app.route('/admin/feedback')
@admin_required
def admin_feedback():
    # Get all feedback messages
    feedback_messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return render_template(
        "admin_dashboard.html", 
        active_section="feedback",
        feedback_messages=feedback_messages
    )

# Admin NIC Management
@app.route('/admin/nic-management')
@admin_required
def admin_nic_management():
    return render_template(
        "admin_dashboard.html", 
        active_section="nic-management"
    )

# Admin Settings
@app.route('/admin/settings')
@admin_required
def admin_settings():
    return render_template(
        "admin_dashboard.html", 
        active_section="settings"
    )

# API endpoints for admin dashboard data
@app.route('/admin/api/stats')
@admin_required
def get_admin_stats():
    # Get real stats from database
    total_users = User.query.count()
    total_searches = SearchHistory.query.count()
    
    # Calculate success rate (placeholder - implement your own logic)
    success_rate = 94.2
    
    # Calculate average rating (placeholder - implement your own logic)
    avg_rating = 4.6
    
    stats = {
        'total_users': total_users,
        'total_searches': total_searches, 
        'success_rate': success_rate,
        'avg_rating': avg_rating
    }
    return jsonify(stats)

# API endpoint for top search queries
@app.route('/admin/api/top-queries')
@admin_required
def get_top_queries():
    # Get top search queries from database
    top_queries = db.session.query(
        SearchHistory.query, 
        db.func.count(SearchHistory.search_id).label('count')
    ).group_by(SearchHistory.query).order_by(db.text('count DESC')).limit(10).all()
    
    result = [{"query": q.query, "count": q.count} for q in top_queries]
    return jsonify(result)

# API endpoint for feedback management
@app.route('/admin/api/feedback')
@admin_required
def get_feedback():
    feedback_messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    result = [{
        "id": msg.message_id,
        "name": msg.name,
        "email": msg.email,
        "subject": msg.subject,
        "message": msg.message,
        "created_at": msg.created_at.strftime("%Y-%m-%d %H:%M:%S")
    } for msg in feedback_messages]
    return jsonify(result)

# API endpoint for responding to feedback
@app.route('/admin/api/feedback/respond', methods=['POST'])
@admin_required
def respond_to_feedback():
    data = request.get_json(silent=True) or {}
    feedback_id = data.get('feedback_id')
    response = data.get('response')
    
    if not feedback_id or not response:
        return jsonify({"success": False, "error": "Missing required fields"}), 400
    
    # Update feedback with response (you'll need to add a response field to your model)
    feedback = ContactMessage.query.get(feedback_id)
    if not feedback:
        return jsonify({"success": False, "error": "Feedback not found"}), 404
    
    # Here you would update the feedback with the response
    # feedback.response = response
    # feedback.status = "resolved"
    # db.session.commit()
    
    return jsonify({"success": True})

# API endpoint for uploading NIC data
@app.route('/admin/api/upload-nic', methods=['POST'])
@admin_required
def upload_nic_data():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        # Process the file (CSV or PDF)
        # This is where you would implement your file processing logic
        # For example, parsing CSV and updating the database
        
        return jsonify({"success": True, "message": "File uploaded successfully"})
    
    return jsonify({"success": False, "error": "Invalid file type"}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'csv', 'pdf'}


if __name__ == "__main__":

    if not os.getenv("DATABASE_URL"):
        print("⚠️ WARNING: DATABASE_URL not configured!")
        print("Please create a .env file with your database configuration")
    app.run(debug=True)

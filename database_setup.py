#!/usr/bin/env python3
"""
Database setup and initialization script
Run this script to create the database and tables
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the PostgreSQL database if it doesn't exist"""
    
    # Parse DATABASE_URL to get connection details
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        print("Please check your .env file")
        return False
    
    try:
        # Extract database name from URL
        # Format: postgresql://username:password@host:port/database_name
        db_name = database_url.split('/')[-1]
        base_url = database_url.rsplit('/', 1)[0]
        
        # Connect to PostgreSQL server (without specific database)
        postgres_url = base_url + '/postgres'
        
        print(f"🔗 Connecting to PostgreSQL server...")
        
        # Parse connection details
        url_parts = postgres_url.replace('postgresql://', '').split('@')
        user_pass = url_parts[0].split(':')
        host_port_db = url_parts[1].split('/')
        
        username = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ''
        host_port = host_port_db[0].split(':')
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else '5432'
        
        # Connect to postgres database to create our app database
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", 
            (db_name,)
        )
        
        if cursor.fetchone():
            print(f"✅ Database '{db_name}' already exists")
        else:
            # Create database
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"✅ Database '{db_name}' created successfully")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"❌ PostgreSQL Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def test_connection():
    """Test the database connection"""
    try:
        database_url = os.getenv("DATABASE_URL")
        conn = psycopg2.connect(database_url)
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ Successfully connected to PostgreSQL")
        print(f"📊 PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def initialize_flask_db():
    """Initialize Flask-SQLAlchemy database and create tables"""
    try:
        from app import app
        
        with app.app_context():
            from models import db
            
            print("🔨 Creating database tables...")
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Test the connection through Flask-SQLAlchemy
            from sqlalchemy import text
            result = db.session.execute(text("SELECT 1")).scalar()
            if result == 1:
                print("✅ Flask-SQLAlchemy connection test passed")
            
        return True
        
    except Exception as e:
        print(f"❌ Flask database initialization failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database setup...")
    print("=" * 50)
    
    # Step 1: Create database
    if create_database():
        print("\n" + "=" * 50)
        
        # Step 2: Test connection
        if test_connection():
            print("\n" + "=" * 50)
            
            # Step 3: Initialize Flask tables
            if initialize_flask_db():
                print("\n🎉 Database setup completed successfully!")
                print("\nYou can now run your Flask app with: python app.py")
            else:
                print("\n❌ Failed to initialize Flask database tables")
        else:
            print("\n❌ Database connection test failed")
    else:
        print("\n❌ Failed to create database")
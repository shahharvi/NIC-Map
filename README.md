# NIC-Map
## 🧠 Semantic Search from Text to National Industrial Classification (NIC) Code

## 📘 Overview
This project aims to build a **semantic search engine** that maps free-form business descriptions to their corresponding **National Industrial Classification (NIC)** codes.  
By understanding the *context* of the query rather than relying only on keywords, it improves accuracy in classifying business activities.  

The system uses **BERT** and **Sentence-BERT** models for semantic embeddings and **FAISS** for efficient similarity search.  
It includes both **User** and **Admin** modules and is implemented as a **Flask + PostgreSQL** web application with an integrated **mini chatbot**.

---

## 🚀 Features

### 👤 User Side
- 🔐 Register, Login, Logout, and Change Password  
- 🏠 Home Page – Project introduction and navigation  
- 🔍 Semantic NIC Search – Natural language search for NIC codes  
- 💬 Mini Chatbot – Conversational search interface  
- 🌗 Dark / Light Theme toggle for a modern UI  
- 📄 About Us
- 📞 Contact Us   

### 🧑‍💻 Admin Side
- 📊 Admin Dashboard showing analytics:
  - Total users
  - Total searches
  - Most frequent NIC categories  
- 📁 NIC Management – Upload updated official NIC PDF and automatically update dataset  

---

## 🏗️ System Architecture

**Frontend:** HTML, CSS, Bootstrap, JavaScript  
**Backend:** Flask (Python), SQLAlchemy ORM  
**Database:** PostgreSQL  
**Models:** Sentence-BERT (`all-MiniLM-L6-v2`)  
**Search Engine:** FAISS (for semantic similarity search)

---

## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/nic-semantic-search.git
cd nic-semantic-search
```

2️⃣ Create Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate       # Windows
```

3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

4️⃣ Create a .env File
```bash
FLASK_ENV=development
SECRET_KEY=your_secret_key_here

DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/nic_semantic

EMBEDDING_MODEL=all-MiniLM-L6-v2
FAISS_INDEX_PATH=faiss_index.index
NIC_DATASET_PATH=nic_with_business_desc.csv

ADMIN_EMAIL=your_email@example.com

```

5️⃣ Initialize the Database
```bash
python
>>> from app import db
>>> db.create_all()
```

6️⃣ Run the Application
```bash
python app.py 
```

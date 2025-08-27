from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search')
def search():
    return render_template('search.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/api/search', methods=['POST'])
def api_search():
    data = request.get_json()
    business_description = data.get('description', '')
    
    # This is where you would implement your NIC code matching logic
    # For now, returning sample data
    sample_results = [
        {
            'code': '62012',
            'description': 'Computer programming activities',
            'confidence': 95
        },
        {
            'code': '62020',
            'description': 'Computer consultancy activities',
            'confidence': 87
        },
        {
            'code': '62030',
            'description': 'Computer facilities management activities',
            'confidence': 78
        }
    ]
    
    return jsonify({
        'success': True,
        'results': sample_results,
        'query': business_description
    })

@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Simple chatbot response logic
    if 'nic code' in message.lower():
        response = "I can help you find the right NIC code for your business. Please describe your business activities and I'll suggest the most relevant codes."
    elif 'help' in message.lower():
        response = "I'm here to assist you with finding NIC codes. You can describe your business, and I'll help match it with the appropriate classification codes."
    else:
        response = f"Thanks for your message: '{message}'. How can I help you find the right NIC code for your business?"
    
    return jsonify({
        'success': True,
        'response': response
    })


@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.get_json()
    code = data.get('code')
    feedback = data.get('feedback')
    
    # Store feedback in database
    # store_feedback(code, feedback)
    
    return jsonify({'success': True})

def process_nic_search(query):
    # Replace with your actual AI model
    # This is sample data
    results = [
        {
            'code': '13924',
            'description': 'Manufacture of bedding, quilts, pillows, sleeping bags etc.',
            'businessType': 'Cotton bedsheet manufacturing',
            'match': '72.06%'
        },
        # Add more results...
    ]
    return results

@app.route('/login')
def login():
    # if 'user' in session:
    #     return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/register')
def register():
    # if 'user' in session:
    #     return redirect(url_for('dashboard'))
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True)
import os
import json
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='frontend')

# Serve static files
@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('frontend', path)

@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')
        
        # Log to console
        print(f"\n[CONTACT SUBMISSION] Received message from {name} ({email})")
        print(f"Subject: {subject}")
        print(f"Message: {message}\n")
        
        # Save to local messages.json
        messages_file = 'messages.json'
        messages = []
        if os.path.exists(messages_file):
            with open(messages_file, 'r') as f:
                try:
                    messages = json.load(f)
                except json.JSONDecodeError:
                    pass
        
        messages.append({
            'name': name,
            'email': email,
            'subject': subject,
            'message': message
        })
        
        with open(messages_file, 'w') as f:
            json.dump(messages, f, indent=4)
            
        return jsonify({'success': True, 'message': 'Message saved successfully.'})
    except Exception as e:
        print(f"Error handling contact submission: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    print("[*] Starting SER Production Server on http://localhost:8000...")
    app.run(port=8000, debug=True)

from flask import Flask, render_template, request, jsonify
import json
import os

app = Flask(__name__)

# Load or initialize reminders safely
reminders = {}

if os.path.exists('reminders.json'):
    try:
        with open('reminders.json', 'r') as f:
            content = f.read().strip()
            if content:
                reminders = json.loads(content)
            else:
                reminders = {}
    except json.JSONDecodeError:
        print("reminders.json is invalid or corrupted. Starting fresh.")
        reminders = {}
else:
    with open('reminders.json', 'w') as f:
        json.dump({}, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_reminders', methods=['GET'])
def get_reminders():
    return jsonify(reminders)

@app.route('/add_reminder', methods=['POST'])
def add_reminder():
    data = request.get_json()
    date = data['date']
    text = data['text']

    if date not in reminders:
        reminders[date] = []
    reminders[date].append(text)

    with open('reminders.json', 'w') as f:
        json.dump(reminders, f)

    return jsonify({'success': True})

@app.route('/delete_reminder', methods=['POST'])
def delete_reminder():
    data = request.get_json()
    date = data['date']
    text = data['text']

    if date in reminders and text in reminders[date]:
        reminders[date].remove(text)
        if not reminders[date]:
            del reminders[date]
        with open('reminders.json', 'w') as f:
            json.dump(reminders, f)
        return jsonify({'success': True})

    return jsonify({'success': False})

# For deployment on Render or localhost
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

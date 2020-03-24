#!flask/bin/python
from flask import Flask,jsonify,render_template
from get import locate

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<callsign>')
def show_location(callsign):
    return jsonify(locate(callsign))

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

from flask import Flask, request, jsonify, send_from_directory
from delivery_optimizer import DeliveryOptimizer
import os

app = Flask(__name__, static_folder='static')

optimizer = DeliveryOptimizer()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/optimize', methods=['POST'])
def optimize():
    try:
        data = request.json
        if not data or 'locations' not in data:
            return jsonify({'error': 'Invalid input data'}), 400
        
        locations = data['locations']
        optimized_route, stats = optimizer.optimize_route(locations)
        return jsonify({'route': optimized_route, 'stats': stats})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
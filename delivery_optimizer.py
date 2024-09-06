import sys
import json
import numpy as np
import os
from tensorflow import keras

class DeliveryOptimizer:
    def __init__(self):
        self.model = None  # Initialize model variable

    def load(self, checkpoint_file):
        """Load the model from a checkpoint file."""
        if os.path.exists(checkpoint_file):
            self.model = keras.models.load_model(checkpoint_file)
        else:
            raise FileNotFoundError(f"Checkpoint file '{checkpoint_file}' not found.")

    def save(self, checkpoint_file):
        """Save the model to a checkpoint file."""
        if self.model:
            self.model.save(checkpoint_file)
        else:
            raise ValueError("Model not initialized. Cannot save.")

    def train(self, locations, episodes=1000):
        """Train the model."""
        # Dummy implementation for training
        # You should implement actual training code here
        self.model = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(2,)),
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(len(locations), activation='softmax')
        ])
        self.model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
        # Training logic should go here

    def get_state(self, current_location, next_location):
        """Get state representation."""
        # Dummy state representation
        return np.array([[current_location['x'] - next_location['x'], 
                          current_location['y'] - next_location['y']]])

    def calculate_stats(self, route, locations):
        """Calculate statistics of the route."""
        # Dummy statistics calculation
        total_distance = 0
        for i in range(len(route) - 1):
            loc1 = locations[route[i]]
            loc2 = locations[route[i + 1]]
            distance = np.sqrt((loc1['x'] - loc2['x']) ** 2 + (loc1['y'] - loc2['y']) ** 2)
            total_distance += distance
        return {
            "total_distance": total_distance,
            "num_locations": len(locations)
        }

    def optimize_route(self, locations):
        """Optimize the route based on the model."""
        if not self.model:
            raise ValueError("Model not loaded or trained.")
        
        num_locations = len(locations)
        route = [0]  # Start from the depot
        unvisited = list(range(1, num_locations))

        while unvisited:
            current = route[-1]
            state = self.get_state(locations[current], locations[unvisited[0]])
            action = np.argmax(self.model.predict(state)[0])
            next_loc = unvisited[action % len(unvisited)]
            
            route.append(next_loc)
            unvisited.remove(next_loc)

        route.append(0)  # Return to depot
        stats = self.calculate_stats(route, locations)
        return route, stats

if __name__ == "__main__":
    # Read JSON from command line
    if len(sys.argv) != 2:
        print("Usage: python delivery_optimizer.py '<locations_json>'")
        sys.exit(1)
    
    locations_json = sys.argv[1]
    try:
        locations = json.loads(locations_json)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)

    optimizer = DeliveryOptimizer()
    
    # Check if the model checkpoint exists
    checkpoint_file = 'trained_delivery_optimizer_model_checkpoint.h5'
    if os.path.exists(checkpoint_file):
        optimizer.load(checkpoint_file)
    else:
        print("No checkpoint found, starting fresh training...")
        optimizer.train(locations, episodes=1000)
        optimizer.save(checkpoint_file)
        print(f"Model saved as '{checkpoint_file}'")

    # Optimize route
    optimized_route, stats = optimizer.optimize_route(locations)
    
    result = {
        "route": optimized_route,
        "stats": stats
    }
    
    print(json.dumps(result))
import numpy as np
import time
import os
from termcolor import colored

def visualize_tensor_terminal(tensor):
    print("\033[H")  # Move cursor to home position
    
    for i in range(tensor.shape[0]):
        for j in range(tensor.shape[1]):
            if tensor.ndim == 3:
                img = tensor[i, j]
            else:
                img = tensor[i, j][:, :]
            
            print("+" + "-" * (img.shape[1] * 2) + "+")
            for row in img:
                print("|", end="")
                for val in row:
                    color = get_color(val)
                    print(colored('██', color), end='')
                print("|")
            print("+" + "-" * (img.shape[1] * 2) + "+")
        print()
        print()

def get_color(val):
    """Get color based on value using a wider range."""
    colors = ['blue', 'cyan', 'green', 'yellow', 'red', 'magenta', 'white']
    index = int(val / (255 / (len(colors) - 1)))
    return colors[min(index, len(colors) - 1)]
# Example usage with dynamic update and smoother transitions:
tensor = np.random.rand(2, 3, 5, 5) * 255
for _ in range(1000):
    tensor += np.random.randn(*tensor.shape) * 10  # Gradually modify the tensor
    tensor = np.clip(tensor, 0, 255)  # Ensure values stay within 0-255
    visualize_tensor_terminal(tensor)
    time.sleep(0.1)  # Adjust speed as needed

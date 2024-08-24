import os
import time
import numpy as np
from termcolor import colored

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def get_color(val):
    colors = ['blue', 'cyan', 'green', 'yellow', 'red', 'magenta']
    return colors[max(0, min(int(val * len(colors)), len(colors) - 1))]

def create_random_tensor(shape):
    try:
        return np.random.randn(*shape)
    except ValueError as e:
        print(f"Error creating tensor: {e}")
        return None

def visualize_tensor(tensor):
    if tensor is None:
        print("Error: Cannot visualize None tensor")
        return
    
    try:
        buffer = []
        shape = tensor.shape
        buffer.append(f"Tensor Visualization - Shape: {shape[0]}x{shape[1]}x{shape[2]}")
        buffer.append("=" * 40)
        
        for z in range(shape[2]):
            buffer.append(f"\nLayer {z + 1} of {shape[2]} (Depth slice at z={z})")
            buffer.append("-" * 40)
            buffer.append(f"Width (y) →")
            for x in range(shape[0]):
                row = []
                if x == 0:
                    row.append("Height(x) ↓ ")
                else:
                    row.append("            ")  # Align with the "Height (x) ↓" label
                for y in range(shape[1]):
                    val = abs(tensor[x, y, z])  # Use absolute value for magnitude
                    color = get_color(val)
                    row.append(colored('██', color))
                buffer.append(''.join(row))
        
        clear_screen()
        print('\n'.join(buffer))
        
        # Add color legend
        print("\nColor Legend (Magnitude):")
        for i, color in enumerate(['blue', 'cyan', 'green', 'yellow', 'red', 'magenta']):
            print(colored(f"██ {i/5:.2f} - {(i+1)/5:.2f}", color))
        
    except IndexError as e:
        print(f"Error visualizing tensor: {e}")


def apply_tensor_operations(tensor, step, user_ops):
    try:
        op_name, op_func = user_ops[step % len(user_ops)]
        return op_func(tensor, step), op_name
    except Exception as e:
        print(f"Error applying operation: {e}")
        return tensor, "error"

def get_user_operations():
    print("Available operations:")
    print("1. Sine (sine)")
    print("2. Tanh (tanh)")
    print("3. Exponential decay (exp_decay)")
    print("4. FFT (fft)")
    print("5. Matrix power (matrix_power)")
    print("6. Convolution (conv)")
    
    ops = [
        ("sine", lambda t, s: np.sin(t)),
        ("tanh", lambda t, s: np.tanh(t)),
        ("exp_decay", lambda t, s: t * np.exp(-0.1 * s)),
        ("fft", lambda t, s: np.real(np.fft.fftn(t))),
        ("matrix_power", lambda t, s: np.array([np.linalg.matrix_power(t[:,:,i], 2) for i in range(t.shape[2])]).transpose(1,2,0)),
        ("conv", lambda t, s: np.array([np.convolve(t[:,:,i].flatten(), np.ones(5)/5, mode='same').reshape(t.shape[:2]) for i in range(t.shape[2])]).transpose(1,2,0)),
    ]
    
    while True:
        try:
            choices = input("Enter the numbers or names of operations you want to use (comma-separated): ")
            chosen_ops = []
            for choice in choices.split(','):
                choice = choice.strip().lower()
                if choice.isdigit():
                    index = int(choice) - 1
                    if 0 <= index < len(ops):
                        chosen_ops.append(ops[index])
                    else:
                        print(f"Invalid number: {choice}. Please enter numbers between 1 and {len(ops)}.")
                        break
                else:
                    op = next((op for name, op in ops if name == choice), None)
                    if op:
                        chosen_ops.append((choice, op[1]))
                    else:
                        print(f"Invalid operation name: {choice}")
                        break
            
            if len(chosen_ops) == len(choices.split(',')):
                return chosen_ops
            
        except ValueError:
            print("Invalid input. Please enter comma-separated numbers or operation names.")

def simulate_training(tensor, steps, user_ops):
    if tensor is None or not user_ops:
        print("Error: Invalid tensor or no operations selected")
        return

    print("\nSimulating tensor operations...")
    print("Watch the tensor evolve through the training steps.")
    print("\nColor Explanation:")
    print("The colors represent the magnitude of the values in the tensor.")
    print("Blue represents the lowest values, while magenta represents the highest values.")
    print("The color scale goes from blue (lowest) -> cyan -> green -> yellow -> red -> magenta (highest).")
    input("Press Enter to start the simulation...")

    original_tensor = tensor.copy()
    history = []

    try:
        for step in range(steps):
            clear_screen()
            print(f"Step {step + 1} of {steps}")
            
            tensor, op_name = apply_tensor_operations(tensor, step, user_ops)
            tensor += np.random.randn(*tensor.shape) * 0.1  # Add some noise
            tensor = np.clip(tensor, -1, 1)  # Clip values
            
            visualize_tensor(tensor)
            history.append((op_name, tensor.copy()))
            
            time.sleep(0.07)  # Pause for a short time to create animation effect

        print("\nSimulation completed.")
        print("\nSummary of operations and their effects:")
        for i, (op_name, _) in enumerate(history):
            print(f"Step {i+1}: Applied {op_name}")
        
        print("\nExplanation of operations:")
        unique_ops = set(op for op, _ in history)
        for op in unique_ops:
            print(f"\nOperation: {op}")
            print(explain_operation_effect(op))
        
        print("\nOverall tensor change:")
        print("Initial tensor:")
        visualize_tensor(original_tensor)
        print("\nFinal tensor:")
        visualize_tensor(tensor)
        
        input("\nPress Enter to return to the main menu...")

    except KeyboardInterrupt:
        print("\nSimulation interrupted by user.")
    except Exception as e:
        print(f"An error occurred during simulation: {e}")
    
    print("Returning to main menu...")



def get_user_steps():
    MAX_STEPS = 1000
    while True:
        try:
            steps = int(input(f"Enter the number of training steps (1-{MAX_STEPS}): "))
            if 1 <= steps <= MAX_STEPS:
                return steps
            else:
                print(f"Please enter a number between 1 and {MAX_STEPS}.")
        except ValueError:
            print("Invalid input. Please enter a positive integer.")

def get_tensor_shape():
    while True:
        try:
            shape_input = input("Enter the tensor shape (comma-separated integers, e.g., 10,10,3): ")
            shape = tuple(map(int, shape_input.split(',')))
            if len(shape) == 3 and all(dim > 0 for dim in shape):
                return shape
            else:
                print("Please enter three positive integers separated by commas.")
        except ValueError:
            print("Invalid input. Please enter three positive integers separated by commas.")

def learn_about_tensors():
    print("""
    Tensors in Machine Learning:
    
    Tensors are multi-dimensional arrays that can represent complex data structures.
    In ML, they're used to store and process data efficiently.
    
    - 0D Tensor: A scalar (single number)
    - 1D Tensor: A vector (list of numbers)
    - 2D Tensor: A matrix (table of numbers)
    - 3D+ Tensor: Higher dimensional data structures
    
    Tensors allow for parallel processing and are crucial for 
    handling large datasets in neural networks and deep learning models.
    """)
    input("Press Enter to continue...")

def explain_operation_effect(op_name):
    explanations = {
        "sine": "Applies sine function to all elements, creating a wave-like pattern in the data.",
        "tanh": "Squashes values to range [-1, 1], useful for introducing non-linearity.",
        "exp_decay": "Reduces tensor values over time, simulating decay or learning rate adjustment.",
        "fft": "Performs Fast Fourier Transform, useful for frequency analysis of the data.",
        "matrix_power": "Raises the matrix to a power, intensifying patterns in the data.",
        "conv": "Applies convolution, often used for feature extraction in neural networks."
    }
    return explanations.get(op_name, "No detailed explanation available for this operation.")



def main_menu():
    while True:
        print("\nTensor Visualization Tool")
        print("1. Learn about tensors")
        print("2. Visualize a 3D-tensor")
        print("3. Explore tensor operations (simulated training)")
        print("4. Exit")
        choice = input("Enter your choice (1-4): ")
        if choice == '1':
            learn_about_tensors()
        elif choice == '2':
            shape = get_tensor_shape()
            tensor = create_random_tensor(shape)
            visualize_tensor(tensor)
        elif choice == '3':
            print("\nExplore tensor operations:")
            print("This option allows you to apply various operations to a tensor")
            print("and visualize how it changes over multiple steps, simulating a training process.")
            input("Press Enter to continue...")
            shape = get_tensor_shape()
            tensor = create_random_tensor(shape)
            user_ops = get_user_operations()
            steps = get_user_steps()
            simulate_training(tensor, steps, user_ops)
        elif choice == '4':
            print("Thank you for using the Tensor Visualization Tool!")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    try:
        main_menu()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

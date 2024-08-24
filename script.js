import * as THREE from "https://unpkg.com/three@0.112/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;

document.addEventListener('DOMContentLoaded', initializeApplication);

function initializeApplication() {
    console.log("Initializing application");
    const canvas = document.getElementById('visualization-canvas');
    if (canvas) {
        console.log("Canvas found");
    } else {
        console.error("Canvas not found");
    }
    initThreeJS();
    setupEventListeners();
    initializeDefaultTensor();
    createColorLegend();
    animate();
}

function initThreeJS() {
    const canvas = document.getElementById('visualization-canvas');
    if (!canvas) {
        console.error("Could not find canvas");
        return;
    }
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    resizeRendererToDisplaySize(renderer);

    const aspect = canvas.clientWidth / canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(20, 20, 20);

    setupOrbitControls();
    setupLighting();
    handleWindowResize();

    scene.add(new THREE.AxesHelper(20));
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function setupOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 1;
    controls.maxDistance = 50;
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0x404040, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(10, 10, 10);
    scene.add(light);
}

function handleWindowResize() {
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

function getColor(val) {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#008000',
        '#FFC0CB', '#800000', '#008080'
    ];
    return colors[Math.floor(Math.abs(val) * (colors.length - 1))];
}

function createColorLegend() {
    const legend = document.getElementById('color-legend');
    if (!legend) return;

    legend.innerHTML = '';
    const colors = [
        '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#008000',
        '#FFC0CB', '#800000', '#008080'
    ];

    colors.forEach((color, index) => {
        const colorBox = document.createElement('div');
        colorBox.style.backgroundColor = color;
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        const minValue = -1 + (index * 2 / (colors.length - 1));
        const maxValue = -1 + ((index + 1) * 2 / (colors.length - 1));
        colorBox.title = `Value range: ${minValue.toFixed(2)} to ${maxValue.toFixed(2)}`;
        legend.appendChild(colorBox);
    });
}

function createRandomTensor(shape) {
    try {
        return shape.reduce((acc, dim) => {
            if (typeof acc === 'function') {
                return Array(dim).fill().map(() => acc());
            } else {
                return Array(dim).fill().map(() => Array.isArray(acc) ? acc.slice() : acc);
            }
        }, () => Math.random() * 2 - 1);
    } catch (e) {
        console.error("Error creating tensor:", e);
        alert("Failed to create random tensor. Please check your input and try again.");
        return null;
    }
}

function visualizeTensor(tensor) {
    if (!tensor) {
        console.error("Error: Cannot visualize null tensor");
        return;
    }

    console.log('Visualizing tensor:', tensor);
    
    const shape = [tensor.length, tensor[0].length, tensor[0][0].length];
    console.log('Tensor shape:', shape);

    createCubes(tensor, shape);
    adjustCamera(shape);
    renderer.render(scene, camera);
}

function clearScene() {
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    scene.add(new THREE.AxesHelper(20));
    setupLighting();
}

function createCubes(tensor, shape) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cubesGroup = new THREE.Group();
    for (let x = 0; x < shape[0]; x++) {
        for (let y = 0; y < shape[1]; y++) {
            for (let z = 0; z < shape[2]; z++) {
                const material = new THREE.MeshPhongMaterial({
                    color: getColor(tensor[x][y][z]),
                    flatShading: true,
                    transparent: true,
                    opacity: Math.abs(tensor[x][y][z])
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(x - shape[0]/2, y - shape[1]/2, z - shape[2]/2);
                cubesGroup.add(cube);
            }
        }
    }
    scene.add(cubesGroup);
    console.log(`Total cubes added: ${shape[0] * shape[1] * shape[2]}`);
}

function adjustCamera(shape) {
    const maxDimension = Math.max(...shape);
    camera.position.set(maxDimension*2, maxDimension*2, maxDimension*2);
    controls.target.set(0, 0, 0);
    controls.update();
}

function animate() {
    requestAnimationFrame(animate);
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    controls.update();
    renderer.render(scene, camera);
}

function applyTensorOperations(tensor, step, userOps) {
    try {
        const [opName, opFunc] = userOps[step % userOps.length];
        return [opFunc(tensor, step), opName];
    } catch (e) {
        console.error("Error applying operation:", e);
        return [tensor, "error"];
    }
}

function sineTensor(tensor) {
    return tensor.map(plane => plane.map(row => row.map(val => Math.sin(val))));
}

function tanhTensor(tensor) {
    return tensor.map(plane => plane.map(row => row.map(val => Math.tanh(val))));
}

function expDecayTensor(tensor, step) {
    const decay = Math.exp(-step / 1000);
    return tensor.map(plane => plane.map(row => row.map(val => val * decay)));
}

function matrixPowerTensor(tensor, power = 2) {
    if (!Array.isArray(tensor) || power < 1 || !Number.isInteger(power)) {
        throw new Error("Invalid input: tensor must be an array and power must be a positive integer.");
    }
    return tensor.map(plane => matrixPower(plane, power));
}

function convTensor(tensor, kernel = [[1,1,1],[1,-8,1],[1,1,1]], stride = 1, padding = 0) {
    if (!Array.isArray(tensor) || !Array.isArray(kernel) || tensor.length === 0 || kernel.length === 0) {
        throw new Error("Invalid input: tensor and kernel must be non-empty arrays");
    }

    const [height, width, channels] = [tensor.length, tensor[0].length, tensor[0][0].length];
    const [kernelHeight, kernelWidth] = [kernel.length, kernel[0].length];

    if (kernelHeight > height || kernelWidth > width) {
        throw new Error("Kernel dimensions cannot be larger than tensor dimensions");
    }

    const outputHeight = Math.floor((height + 2 * padding - kernelHeight) / stride) + 1;
    const outputWidth = Math.floor((width + 2 * padding - kernelWidth) / stride) + 1;

    const output = new Array(outputHeight).fill().map(() => 
        new Array(outputWidth).fill().map(() => 
            new Array(channels).fill(0)
        )
    );

    for (let c = 0; c < channels; c++) {
        for (let i = 0; i < outputHeight; i++) {
            for (let j = 0; j < outputWidth; j++) {
                let sum = 0;
                for (let ki = 0; ki < kernelHeight; ki++) {
                    for (let kj = 0; kj < kernelWidth; kj++) {
                        const ii = i * stride + ki - padding;
                        const jj = j * stride + kj - padding;
                        if (ii >= 0 && ii < height && jj >= 0 && jj < width) {
                            sum += tensor[ii][jj][c] * kernel[ki][kj];
                        }
                    }
                }
                output[i][j][c] = sum;
            }
        }
    }

    return output;
}

function explainOperationEffect(opName) {
    const explanations = {
        "sine": "Applies the sine function to all elements, creating a wave-like pattern in the data. This can introduce cyclical patterns and is useful for modeling periodic phenomena.",
        "tanh": "Applies the hyperbolic tangent function, squashing values to the range [-1, 1]. This is useful for introducing non-linearity and is commonly used as an activation function in neural networks.",
        "exp_decay": "Applies exponential decay to the tensor values over time. This simulates processes that decrease at a rate proportional to the current value, such as radioactive decay or the cooling of an object.",
        "matrix_power": "Raises each 2D slice of the tensor to a power. This can amplify patterns in the data and is useful for studying how information propagates through multiple layers of a neural network.",
        "conv": "Applies a convolution operation, which is fundamental to many deep learning architectures, especially in image processing. It can detect features or patterns in the input data."
    };
    return explanations[opName] || "No detailed explanation available for this operation.";
}

function getUserOperations() {
    const operationsMap = {
        "sine": sineTensor,
        "tanh": tanhTensor,
        "exp_decay": expDecayTensor,
        "matrix_power": matrixPowerTensor,
        "conv": convTensor
    };

    const selectedOps = Array.from(document.querySelectorAll('input[name="operation"]:checked'))
        .map(checkbox => [checkbox.value, operationsMap[checkbox.value]]);

    return selectedOps.length > 0 ? selectedOps : null;
}

function getTensorShape() {
    const shapeInput = document.getElementById('tensor-shape');
    if (!shapeInput) {
        console.error('Tensor shape input not found');
        return null;
    }
    const shapeString = shapeInput.value;
    const shape = shapeString.split(',').map(s => parseInt(s.trim(), 10));
    if (shape.length !== 3 || shape.some(isNaN)) {
        alert('Please enter a valid 3D tensor shape (e.g., 10,10,3)');
        return null;
    }
    return shape;
}

function getSimulationSteps() {
    const stepsInput = document.getElementById('step-count');
    if (!stepsInput) {
        console.error('Step count input not found');
        return null;
    }
    const steps = parseInt(stepsInput.value, 10);
    if (isNaN(steps) || steps < 1 || steps > 1000) {
        alert('Please enter a valid number of steps between 1 and 1000');
        return null;
    }
    return steps;
}

async function simulateTraining() {
    const shape = getTensorShape();
    if (!shape) return;

    let currentTensor = createRandomTensor(shape);
    if (!currentTensor) {
        alert('Failed to create tensor. Please try again.');
        return;
    }

    const userOps = getUserOperations();
    if (!userOps) {
        alert('Please select at least one operation.');
        return;
    }

    const steps = getSimulationSteps();
    if (!steps) return;

    const progressElement = document.getElementById('simulation-progress');
    const explanationElement = document.getElementById('operation-explanation');

    // Clear the explanation at the start of simulation
    if (explanationElement) explanationElement.textContent = '';

    function simulationStep(step) {
        if (step >= steps) {
            if (progressElement) progressElement.textContent = 'Simulation complete!';
            // Only update explanation when simulation is complete
            const lastOpName = userOps[(steps - 1) % userOps.length][0];
            if (explanationElement) explanationElement.textContent = explainOperationEffect(lastOpName);
            return;
        }

        const [newTensor, opName] = applyTensorOperations(currentTensor, step, userOps);
        currentTensor = newTensor;

        visualizeTensor(currentTensor);
        if (progressElement) progressElement.textContent = `Step ${step + 1}/${steps}: Applied ${opName}`;

        setTimeout(() => simulationStep(step + 1), 100);
    }

    simulationStep(0);
}


function setupEventListeners() {
    const tensorForm = document.getElementById('tensor-form');
    const simulationForm = document.getElementById('simulation-form');
    const operationCheckboxes = document.querySelectorAll('input[name="operation"]');

    if (tensorForm) {
        tensorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const shape = getTensorShape();
            if (shape) {
                clearScene();
                const tensor = createRandomTensor(shape);
                if (tensor) visualizeTensor(tensor);
            }
        });
    } else {
        console.error('Tensor form not found');
    }

    if (simulationForm) {
        simulationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearScene();
            simulateTraining();
        });
    } else {
        console.error('Simulation form not found');
    }

    operationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const explanationElement = document.getElementById('operation-explanation');
            if (checkbox.checked) {
                explanationElement.textContent = explainOperationEffect(checkbox.value);
            } else if (!Array.from(operationCheckboxes).some(cb => cb.checked)) {
                explanationElement.textContent = '';
            }
        });
    });
}

function initializeDefaultTensor() {
    clearScene();
    const defaultTensor = createRandomTensor([10, 10, 3]);
    console.log("Default tensor:", defaultTensor);
    if (defaultTensor) visualizeTensor(defaultTensor);
}

document.addEventListener('DOMContentLoaded', initializeApplication);


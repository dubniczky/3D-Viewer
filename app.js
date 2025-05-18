// app.js

// Include Three.js via a script tag in your HTML file:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
// Also include the STLLoader script:
// <script src="https://cdn.jsdelivr.net/npm/three/examples/js/loaders/STLLoader.js"></script>

document.body.style.margin = 0;
document.body.style.overflow = 'hidden';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set the background color to dark gray
renderer.setClearColor(0x2e2e2e); // Dark gray color

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Intensity set to 1.5 for brightness
scene.add(ambientLight);

// Increase the intensity of the directional light
const light = new THREE.DirectionalLight(0xffffff, 2); // Intensity set to 2 for stronger light
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Set up the camera position
camera.position.z = 5;

// Add OrbitControls for mouse interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable smooth damping effect
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // Disable panning
controls.minDistance = 1; // Set minimum zoom distance
controls.maxDistance = 100; // Set maximum zoom distance

// Add drag-and-drop functionality
const loader = new THREE.STLLoader();
renderer.domElement.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
});

renderer.domElement.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.stl')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const geometry = loader.parse(e.target.result);
            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);

            const maxDimension = Math.max(size.x, size.y, size.z);
            const scaleFactor = 5 / maxDimension; // Scale to fit within a 5-unit cube
            geometry.scale(scaleFactor, scaleFactor, scaleFactor);

            const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Center the geometry
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            camera.position.set(0, -10, 0);
            camera.lookAt(mesh.position);
            console.log('Mesh added with scale and center adjustments:', mesh); 
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please drop a valid STL file.');
    }
});

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Add a grid helper to the scene
const gridHelper = new THREE.GridHelper(50, 50); // Size 50, divisions 50
scene.add(gridHelper);

// Create a static grid as a background
const gridBackground = new THREE.GridHelper(50, 50, 0x444444, 0x444444); // Dark gray grid
gridBackground.rotation.x = Math.PI / 2; // Rotate to lie flat on the background
scene.add(gridBackground);

// Reference the checkbox from the HTML
const gridCheckbox = document.getElementById('gridCheckbox');
gridCheckbox.addEventListener('change', () => {
    gridBackground.visible = gridCheckbox.checked;
});

const axesCheckbox = document.getElementById('axesCheckbox');
axesCheckbox.addEventListener('change', () => {
    axesHelper.visible = axesCheckbox.checked;
});

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}
animate();
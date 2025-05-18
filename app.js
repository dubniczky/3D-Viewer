const gridSize = 50 // Unit size for both directions
const gridDivisions = 50 // Number of divisions in both directions
const gridColor = 0x444444 // Dark gray color for the grid lines

let modelLoaded = false

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
const objLoader = new THREE.OBJLoader();
const threeMFLoader = new THREE.ThreeMFLoader();

const welcomeMessageContainer = document.getElementById('welcome-message');

renderer.domElement.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
});

renderer.domElement.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.stl')) {
        welcomeMessageContainer.style.display = 'none'; // Hide the welcome message when a file is loaded
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

            camera.position.set(0, 0, 10);
            camera.lookAt(mesh.position);
            console.log('Mesh added with scale and center adjustments:', mesh); 
        };
        reader.readAsArrayBuffer(file);
    } else if (file && file.name.endsWith('.obj')) {
        welcomeMessageContainer.style.display = 'none'; // Hide the welcome message when a file is loaded
        const reader = new FileReader();
        reader.onload = (e) => {
            const obj = objLoader.parse(e.target.result);
            scene.add(obj);
            camera.position.set(0, 0, 10);
            camera.lookAt(obj.position);
        };
        reader.readAsText(file);
    } else if (file && file.name.endsWith('.3mf')) {
        welcomeMessageContainer.style.display = 'none'; // Hide the welcome message when a file is loaded
        const reader = new FileReader();
        reader.onload = (e) => {
            const object = threeMFLoader.parse(e.target.result);

            // Create a new group to hold the object
            const group = new THREE.Group();
            group.add(object);

            // Compute bounding box for the entire group
            const box = new THREE.Box3().setFromObject(group);
            const size = new THREE.Vector3();
            box.getSize(size);

            // Scale the group to fit within a 5-unit cube
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scaleFactor = 5 / maxDimension;
            group.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Recompute the bounding box after scaling
            box.setFromObject(group);
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Center the group by adjusting its position
            group.position.sub(center);

            // Add the group to the scene
            scene.add(group);

            // Adjust the camera to focus on the group
            camera.position.set(0, 0, 10);
            camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please drop a valid STL, OBJ, or 3MF file.');
    }
});

renderer.domElement.addEventListener('click', () => {
    if (modelLoaded) {
        return
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl, .obj, .3mf';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.stl')) {
            welcomeMessageContainer.style.display = 'none'; // Hide the message when a file is loaded
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

                camera.position.set(0, 0, 10);
                camera.lookAt(mesh.position);
                console.log('Mesh added with scale and center adjustments:', mesh); 
            };
            reader.readAsArrayBuffer(file);
        } else if (file && file.name.endsWith('.obj')) {
            welcomeMessageContainer.style.display = 'none'; // Hide the message when a file is loaded
            const reader = new FileReader();
            reader.onload = (e) => {
                const obj = objLoader.parse(e.target.result);
                scene.add(obj);
                camera.position.set(0, 0, 10);
                camera.lookAt(obj.position);
            };
            reader.readAsText(file);
        } else if (file && file.name.endsWith('.3mf')) {
            welcomeMessageContainer.style.display = 'none'; // Hide the message when a file is loaded
            const reader = new FileReader();
            reader.onload = (e) => {
                const object = threeMFLoader.parse(e.target.result);

                // Compute bounding box
                const box = new THREE.Box3().setFromObject(object);
                const size = new THREE.Vector3();
                box.getSize(size);

                // Scale the object to fit within a 5-unit cube
                const maxDimension = Math.max(size.x, size.y, size.z);
                const scaleFactor = 5 / maxDimension;
                object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                // Center the object
                const center = new THREE.Vector3();
                box.getCenter(center);
                object.position.sub(center);

                scene.add(object);
                camera.position.set(0, 0, 10);
                camera.lookAt(object.position);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Please select a valid STL, OBJ, or 3MF file.');
        }
        document.body.removeChild(input);
    });
    modelLoaded = true
});

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Add grids to the scene
const horizontalGrid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor)
scene.add(horizontalGrid) // Lies flat on the background

const frontGrid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor)
frontGrid.rotation.x = Math.PI / 2; // Rotate to be vertical in front of the camera
scene.add(frontGrid)

const sideGrid = new THREE.GridHelper(gridSize, gridDivisions, gridColor, gridColor)
sideGrid.rotation.z = Math.PI / 2; // Rotate to be vertical, through the camera
scene.add(sideGrid)

// Reference the checkbox from the HTML
const gridCheckbox = document.getElementById('grid-checkbox');
gridCheckbox.addEventListener('change', () => {
    frontGrid.visible = gridCheckbox.checked;
    horizontalGrid.visible = gridCheckbox.checked; // Disable horizontal grid as well
});

const axesCheckbox = document.getElementById('axes-checkbox');
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
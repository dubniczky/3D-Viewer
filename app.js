'use strict'

// Settings
const gridSize = 50 // Unit size for both directions
const gridDivisions = 50 // Number of divisions in both directions
const gridColor = 0x444444 // Dark gray color for the grid lines
const backgroundColor = 0x2e2e2e // Dark gray window clear color
const lightColor = 0xffffff // White color for the light
const modelMeshColor = 0x808080 // Light gray color for the model mesh
const defaultCameraPosition = [0, 0, 5]
const diffuseLightDirection = [1, 1, 1]


// State
let modelLoaded = false
let ambientLightIntensity = 1.0
let diffuseLightIntensity = 1.5


// Load controls
const welcomeMessageContainer = document.getElementById('welcome-message')
const gridCheckbox = document.getElementById('grid-checkbox')
const axesCheckbox = document.getElementById('axes-checkbox')
const modelUploader = document.getElementById('model-uploader')
const wireframeCheckbox = document.getElementById('wireframe-checkbox')


// Load Three.js
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setClearColor(backgroundColor)
camera.position.set(...defaultCameraPosition)


// Add lighting
const ambientLight = new THREE.AmbientLight(lightColor, ambientLightIntensity)
scene.add(ambientLight)
const diffuseLight = new THREE.DirectionalLight(lightColor, diffuseLightIntensity)
diffuseLight.position.set(...diffuseLightDirection).normalize()
scene.add(diffuseLight)


// Add axes helper lines to the scene
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


// Add orbit controls for camera movement
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true
controls.dampingFactor = 0.1
controls.screenSpacePanning = false
controls.minDistance = 1 // minimum zoom distance
controls.maxDistance = 100 // maximum zoom distance


// Set up loaders
const loaders = {
    'obj': new THREE.OBJLoader(),
    'stl': new THREE.STLLoader(),
    '3mf': new THREE.ThreeMFLoader()
}
// Set up model uploader accepted formats
modelUploader.accept = Object.keys(loaders).map(x => '.' + x).join(', ')


// Geometry loaders
function loadStlGeometry(geometry) {
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox
    const size = new THREE.Vector3()
    bbox.getSize(size)

    const maxDimension = Math.max(size.x, size.y, size.z)
    const scaleFactor = 5 / maxDimension // Scale to fit within a 5-unit cube
    geometry.scale(scaleFactor, scaleFactor, scaleFactor)

    const material = new THREE.MeshStandardMaterial({ color: modelMeshColor })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Center the geometry
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)

    camera.position.set(...defaultCameraPosition)
    camera.lookAt(mesh.position)
}

function loadObjGeometry(geometry) {
    geometry.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeBoundingBox()
            const bbox = child.geometry.boundingBox
            const size = new THREE.Vector3()
            bbox.getSize(size)

            const maxDimension = Math.max(size.x, size.y, size.z)
            const scaleFactor = 5 / maxDimension // Scale to fit within a 5-unit cube
            child.geometry.scale(scaleFactor, scaleFactor, scaleFactor)

            const material = new THREE.MeshStandardMaterial({ color: modelMeshColor })
            const mesh = new THREE.Mesh(child.geometry, material)
            scene.add(mesh)

            // Center the geometry
            const center = new THREE.Vector3()
            bbox.getCenter(center)
            child.geometry.translate(-center.x, -center.y, -center.z)

            camera.position.set(...defaultCameraPosition)
            camera.lookAt(mesh.position)
        }
    });
}

function load3mfGeometry(geometry) {
    let size = new THREE.Vector3();
    geometry.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeBoundingBox()
            const bbox = child.geometry.boundingBox
            bbox.getSize(size)

            const maxDimension = Math.max(size.x, size.y, size.z)
            const scaleFactor = 5 / maxDimension // Scale to fit within a 5-unit cube
            child.geometry.scale(scaleFactor, scaleFactor, scaleFactor)

            const material = new THREE.MeshStandardMaterial({ color: modelMeshColor })
            const mesh = new THREE.Mesh(child.geometry, material)
            scene.add(mesh)

            const center = new THREE.Vector3()
            bbox.getCenter(center)
            child.geometry.translate(-center.x, -center.y, -center.z)
            camera.position.set(...defaultCameraPosition)
            camera.lookAt(mesh.position)
        }
    })
}


// Model loader
function loadModel(file) {
    console.log('Loading model...')
    const format = file.name.split('.').at(-1).toLowerCase()
    if (!loaders[format]) {
        alert('Unsupported file format. Please upload an OBJ, STL, or 3MF file.')
        return
    }
    const loader = loaders[format]
    console.log('Format:', format)

    const reader = new FileReader()
    reader.onload = (e) => {
        let geometry = null
        try {
            geometry = loader.parse(e.target.result);
        } catch (error) {
            console.error('Error parsing geometry:', error)
            alert('Error parsing geometry. The file might be corrupted or in an unsupported format.')
            return
        }

        switch (format) {
            case 'obj':
                loadObjGeometry(geometry)
                break
            case 'stl':
                loadStlGeometry(geometry)
                break
            case '3mf':
                load3mfGeometry(geometry)
                break
        }
        
        console.log('Model loaded successfully')
        welcomeMessageContainer.style.display = 'none'
        modelLoaded = true
    };
    reader.onerror = (error) => {
        console.error('Error reading file:', error)
        alert('Error reading file. Please try again.')
    }

    if (format === 'obj') { // OBJ files are text-based
        reader.readAsText(file)
    } else {
        reader.readAsArrayBuffer(file)
    }
}


// Generic Events
renderer.domElement.addEventListener('dragover', (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy on the mouse
})
renderer.domElement.addEventListener('drop', (event) => {
    event.preventDefault()
    if (event.dataTransfer.files.length !== 1) {
        alert('Only a single file is supported.')
        return
    }
    loadModel(event.dataTransfer.files[0])
})
renderer.domElement.addEventListener('click', () => {
    // If a model is loaded, do not open the file dialog on click
    // It would open constantly on dragging the model
    if (modelLoaded) {
        return
    }
    modelUploader.click()
})
modelUploader.addEventListener('change', (event) => {
    if (event.target.files.length !== 1) {
        alert('Only a single file is supported.')
        return
    }
    loadModel(event.target.files[0])
})
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
});


// Sidebar control events
gridCheckbox.addEventListener('change', () => {
    frontGrid.visible = gridCheckbox.checked
    horizontalGrid.visible = gridCheckbox.checked // Disable horizontal grid as well
})
axesCheckbox.addEventListener('change', () => {
    axesHelper.visible = axesCheckbox.checked
})
wireframeCheckbox.addEventListener('change', () => {
    scene.traverse((child) => {
        if (child.isMesh) {
            child.material.wireframe = wireframeCheckbox.checked
        }
    })
})


// Animation loop
function animate() {
    requestAnimationFrame(animate)
    controls.update() // Update controls
    renderer.render(scene, camera)
}
animate()

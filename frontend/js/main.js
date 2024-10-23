let scene, camera, renderer; // Declare variables for Three.js
let ruleTree; // Variable to hold the rule tree
let font; // Variable to hold the loaded font

// Initialize the Three.js scene
function init() {
    const canvas = document.getElementById('rulesCanvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10); // Position camera further away to see the tree better

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    
    // Load the font
    const loader = new THREE.FontLoader(); // Use FontLoader here
    loader.load('https://cdn.jsdelivr.net/npm/three@0.135.0/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
        font = loadedFont; // Store the loaded font
        animate(); // Start animation after loading font
    });
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle rule submission and visualization
async function submitRule() {
    const ruleText = document.getElementById("ruleInput").value;
    const dataText = document.getElementById("dataInput").value;

    try {
        const ruleData = {
            rules: JSON.parse(ruleText),
            data: JSON.parse(dataText)
        };

        console.log('Sending ruleData:', JSON.stringify(ruleData, null, 2));

        const response = await fetch('http://localhost:3000/evaluate-rule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ruleData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        document.getElementById("astOutput").innerText = JSON.stringify(result.ast, null, 2);
        document.getElementById("resultOutput").innerText = result.result;

        // Visualize the rules after evaluation
        visualizeRulesAsTree(result.ast); // Call the visualization function with the AST
    } catch (error) {
        console.error('Error:', error);
        document.getElementById("resultOutput").innerText = 'Error: ' + error.message;
    }
}

// Combine two sets of rules and visualize as a tree
function combineRules() {
    const rule1 = document.getElementById("ruleInput1").value;
    const rule2 = document.getElementById("ruleInput2").value;

    const combinedRules = {
        ...JSON.parse(rule1),
        ...JSON.parse(rule2)
    };

    document.getElementById("ruleInput").value = JSON.stringify(combinedRules, null, 2);

    // Visualize combined rules
    visualizeRulesAsTree(combinedRules); // Call the visualization function with the combined rules
}

// Visualize rules as a tree structure using Three.js
function visualizeRulesAsTree(rules) {
    // Clear previous tree if it exists
    if (ruleTree) {
        scene.remove(ruleTree);
    }

    ruleTree = new THREE.Group();
    createTreeNodes(ruleTree, rules, 0);
    scene.add(ruleTree);
}

// Create tree nodes recursively
function createTreeNodes(parent, rules, level) {
    const nodeSpacing = 3; // Increase spacing between nodes
    const depth = Object.keys(rules).length; // Number of rules
    let currentIndex = 0; // To manage positioning of nodes at the current level

    for (const [key, rule] of Object.entries(rules)) {
        const node = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0x0077ff })
        );

        // Set position for the node
        node.position.set((currentIndex - (depth - 1) / 2) * nodeSpacing, -level * nodeSpacing, 0);
        parent.add(node);
        currentIndex++; // Increment index for next node

        // Create text for the node only if font is loaded
        if (font) {
            const textGeometry = new THREE.TextGeometry(`${key}: ${rule.operator} ${rule.value}`, {
                font: font,
                size: 0.3,
                height: 0.1,
            });

            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.set(node.position.x - 0.5, node.position.y + 0.5, node.position.z); // Adjust text position
            parent.add(textMesh);
        }

        // Check for nested rules and call recursively if they exist
        if (rule.rules && Object.keys(rule.rules).length > 0) {
            createTreeNodes(parent, rule.rules, level + 1); // Recursively add child nodes
        }
    }
}

// Initialization
init();

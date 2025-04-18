import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'ScrollTrigger';
import Lenis from 'lenis';

// --- Smooth Scroll ---
const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


// --- GSAP ---
gsap.registerPlugin(ScrollTrigger);


// --- Three.js Scene ---
let scene, camera, renderer, particles;
const canvasContainer = document.getElementById('webgl-canvas-container');

function initThreeJS() {
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5; // Start slightly further back

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true for transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI screens
    canvasContainer.appendChild(renderer.domElement);

    // Floating Particles - Enhanced
    const particleCount = 1000; // Increased particle count for density
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3); // For subtle movement

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArray[i3 + 0] = (Math.random() - 0.5) * 15; // Wider spread
        posArray[i3 + 1] = (Math.random() - 0.5) * 15;
        posArray[i3 + 2] = (Math.random() - 0.5) * 15;

        velocityArray[i3 + 0] = (Math.random() - 0.5) * 0.0005; // Slower random movement
        velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.0005;
        velocityArray[i3 + 2] = (Math.random() - 0.5) * 0.0005;
    }


    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    // Store velocities for animation
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3));


    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.01, // Smaller particle size for subtlety
        // Slightly desaturated color to blend better
        color: new THREE.Color(0x00aaff), // Adjusted color
        transparent: true,
        opacity: 0.4, // Slightly lower opacity
        blending: THREE.AdditiveBlending, // Keep additive blending for glow
        depthWrite: false // Prevent particles from obscuring each other unnaturally
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animateThreeJS();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Mouse movement interaction
let mouseX = 0;
let mouseY = 0;
const targetCameraPos = new THREE.Vector3(); // Target position for smooth camera movement

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update target position based on mouse, keep Z the same as current camera Z influenced by scroll
    targetCameraPos.x = mouseX * 0.5; // Reduced influence range
    targetCameraPos.y = mouseY * 0.5;

});


function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);

    const elapsedTime = Date.now() * 0.0001; // Use time for continuous subtle drift

    // Particle animation - Add subtle drift
    if (particles) {
         const positions = particles.geometry.attributes.position.array;
         const velocities = particles.geometry.attributes.velocity.array; // Get velocities

         for (let i = 0; i < positions.length; i += 3) {
             // Update position based on velocity
             positions[i + 0] += velocities[i + 0];
             positions[i + 1] += velocities[i + 1];
             positions[i + 2] += velocities[i + 2];

             // Optional: Add subtle sine wave movement for variation
             positions[i + 1] += Math.sin(elapsedTime + positions[i + 0] * 10) * 0.001;

             // Boundary check (wrap around) - simple version
             if (positions[i + 0] > 7.5) positions[i + 0] = -7.5;
             if (positions[i + 0] < -7.5) positions[i + 0] = 7.5;
             if (positions[i + 1] > 7.5) positions[i + 1] = -7.5;
             if (positions[i + 1] < -7.5) positions[i + 1] = 7.5;
             if (positions[i + 2] > 7.5) positions[i + 2] = -7.5;
             if (positions[i + 2] < -7.5) positions[i + 2] = 7.5;
         }
         particles.geometry.attributes.position.needsUpdate = true; // Important!


        // Subtle overall rotation remains
        particles.rotation.x += 0.00005; // Slower rotation
        particles.rotation.y += 0.0001;

        // Smooth camera movement towards target mouse position
        // Lerp (linear interpolate) camera position towards target
        // Keep the camera's Z position controlled by ScrollTrigger
        camera.position.x += (targetCameraPos.x - camera.position.x) * 0.05; // Smoothing factor
        camera.position.y += (targetCameraPos.y - camera.position.y) * 0.05;

        camera.lookAt(scene.position); // Always look at the center
    }


    renderer.render(scene, camera);
}

// --- GSAP Animations ---
function initAnimations() {
    // Hero Animation
    gsap.to(".hero-content", {
        opacity: 1,
        y: 0,
        duration: 1.2, // Slightly longer duration
        ease: "power3.out",
        delay: 0.5
    });

    // Reveal Animations on Scroll
    gsap.utils.toArray('.reveal').forEach(elem => {
        ScrollTrigger.create({
            trigger: elem,
            start: "top 90%", // Start animation a bit earlier
            end: "bottom 10%",
            toggleClass: 'is-visible', // Use toggleClass for efficiency
            once: true // Trigger animation only once
            // markers: true // Uncomment for debugging trigger points
        });
    });

    // Parallax effect for the hero background (adjust Three.js camera)
    gsap.to(camera.position, {
        z: 4, // Zoom in slightly less aggressively
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1, // Smoother scrubbing
        }
    });
     // Update target Z position for mouse look based on scroll
     ScrollTrigger.addEventListener("refresh", () => {
        targetCameraPos.z = camera.position.z; // Ensure target Z matches scrolled Z
     });
     ScrollTrigger.addEventListener("scroll", () => {
        targetCameraPos.z = camera.position.z; // Update target Z during scroll
     })
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
});
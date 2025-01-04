import './style.css'

import * as THREE from 'three';

/**
 * Create a scene where 3d objects, lights and cameras are added.
 * Hierarchy, where the scene is the top-level parent.
 */
const scene = new THREE.Scene();
/**
 * Lookup Viewing Frustum
 * 
 * FOV - field of view, controls the angle of the viewable area.
 * Aspect Ratio - aspect ratio of the viewable area.
 * Near - the distance from the camera to the near clipping plane.
 * Far - the distance from the camera to the far clipping plane.
 */
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

/**
 * Renders the scene to canvas element
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
/**
 * Add the canvas element to the DOM
 */
document.body.appendChild( renderer.domElement );

/**
 * Create a box base geometry
 */
const geometry = new THREE.BoxGeometry( 1, 1, 1 );

/**
 * Basic material to color the geometry.
 * Color is in hexadecimal format. We don't need to provide lighting
 * for MeshBasicMaterial.
 */
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

/**
 * Create a mesh that takes a geometry and material and combines them into 
 * a single object that we add to the scene or to another object.
 */
const cube = new THREE.Mesh( geometry, material );

/**
 * Add the cube mesh to the scene at 0,0,0 by default.
 */
scene.add( cube );

/**
 * Since camera is currently at 0,0,0, it is inside the cube currently.
 * Move the camera to see the cube.
 */
camera.position.z = 5;

/**
 * Animation function that is called every frame.
 */
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
	renderer.render( scene, camera );
}

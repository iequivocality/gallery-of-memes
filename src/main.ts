import './style.css'

import * as THREE from 'three';

const images = [
  "max_verstappen.jpg",
  "you_luke_huge.png",
  "mercy.jpg",
  "def_hop_on_later.png",
  "groundbreaking.jpg",
]

/**
 * Create texture loader for images
 */
const textureLoader = new THREE.TextureLoader();

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
 * We will follow a simple hierarchy of objects.
 * Scene -> RootNode -> (Artwork) -> ArtworkBaseNode -> Artwork 
 */
const rootNode = new THREE.Object3D();
scene.add(rootNode);

/**
 * We will iterate and add six artworks to the scene following the hierarchy
 * illustrated earlier.
 */
const count = images.length;
for (let i = 0; i < count; i++) {
  /**
   * Add textures to the artwork by loading the images.
   * For now, I'll just use a single image for all artworks.
   */
  const texture = textureLoader.load(images[i]);
  /**
   * Set the color space so that it does not look desaturated.
   * srgb is the default color space that we will be using.
   */
  texture.colorSpace = THREE.SRGBColorSpace;

  /**
   * We need to create a "base node" for which the children (artworks) will be added.
   * The children will inherit the transformations of the base node.
   * 
   * We will use Object3D, which is an object that has no geometric representation or material
   * and is invisible from rendering but you can perform transformations on it and can
   * become parent of other objects.
   */
  const artworkBaseNode = new THREE.Object3D();
  artworkBaseNode.rotation.y = i * ( 2 * Math.PI / count );
  rootNode.add(artworkBaseNode);

  /**
   * Forgot to document adding the border.
   * We added a border mesh that is slightly larger than the artwork mesh.
   */
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x404040 })
  );
  border.position.z = -4;
  artworkBaseNode.add(border); 

  /**
   * Add the artwork to the scene. We will replace the color with map.
   */
  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );

  /** Since the artwork was added on 0,0,0 initally, move it slightly backward */
  artwork.position.z = -4;
  artworkBaseNode.add(artwork);
}

/**
 * Added an acceleration factor
 */
let lespeed = 0.004;

/**
 * Increase rotation velocity by 0.004 every two seconds.
 * Commented out for now.
 */
// setInterval(() => {
//   lespeed += 0.004;
// }, 2000);

/**
 * There are many types of light we can use on the Three JS scene.
 * 
 * AmbientLight - light everything uniformly
 * DirectionalLight - lights from a specific direction (like a sun)
 * PointLight - like a light bulb in a dark basement
 * 
 * However, we will be using SpotLight, which is a light that is projected from a point in space.
 * 
 * Add SpotLight to the scene. In order to have lighting on the scene, 
 * we need to convert the MeshBasicMaterial to MeshStandardMaterial because
 * MeshBasicMaterial does not take into account lighting.
 * 
 * color
 * intensity
 * distance
 * angle (in radians)
 * penumbra (the higher the value, the more the light is spread out on the edges)
 * decay (not set in this instance)
 * 
 * Initially, the spotlight is set on 0,0,0 so when MeshStandardMaterial is used,
 * the we do not see anything. We need to set the position of the light first to make sure they are pointed on the artwork.
 * 
 * We can also set the spotlight's target. We also need to add the target to the scene.
 */
const spotLight = new THREE.SpotLight( 0xffffff, 100.0, 10.0, 0.65, 0.6 );
spotLight.position.set(0, 5, 0);
spotLight.target.position.set(0, 0.5, -5);
scene.add( spotLight.target )
scene.add( spotLight );

/**
 * Animation function that is called every frame.
 */
function animate() {
  /**
   * Temporary rotation to demonstrate the added artwork mesh on the screen
   */
  rootNode.rotation.y += lespeed;
	renderer.render( scene, camera );
}

/**
 * Add listener to update the renderer size when the window is resized.
 * The camera's aspect ratio need to be updated since the renderer resized.
 * Then call updateProjectionMatrix (Look it up for future reading).
 * 
 * Ideally, include this in any Three JS project.
 */
window.addEventListener( 'resize', () => {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
import './style.css'

import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
// @ts-ignore
import { Tween, Easing, update as updateTween } from 'tween';

const images = [
  {
    title: "Max Verstappen",
    artist: "Max Verstappen",
    image: "max_verstappen.jpg",
  },
  {
    title: "You Luke Huge",
    artist: "You Luke",
    image: "you_luke_huge.png",
  },
  {
    title: "Mercy",
    artist: "Mercy",
    image: "mercy.jpg",
  },
  {
    title: "Def Hop On Later",
    artist: "Def Hop On Later",
    image: "def_hop_on_later.png",
  },
  {
    title: "Groundbreaking",
    artist: "Groundbreaking",
    image: "groundbreaking.jpg",
  }
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
 *                                                   -> Left & Right Arrows         
 */
const rootNode = new THREE.Object3D();
scene.add(rootNode);

/**
 * Let us get the texture for the left and right arrow.
 */
const leftArrowTexture = textureLoader.load("chevron-left.png");
const rightArrowTexture = textureLoader.load("chevron-right.png");

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
  const texture = textureLoader.load(images[i].image);
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
    new THREE.BoxGeometry(3.1, 2.1, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x404040 })
  );
  border.name = `Border_${i}`
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
  artwork.name = `Artwork_${i}`
  artworkBaseNode.add(artwork);

  /** 
   * Let us add the left and right arrow meshes
   * We will use a plane geometry so we do not see the arrow on the sides when using
   * BoxGeometry. We can use the texture loader to load the texture - chevron-left.png
   * and chevron-right.png. We can load outside the for loop for performance.
   * 
   * We set transparency to true so that we can take into account the alpha channel
   * of the texture loaded from the PNG files. The positions are adjusted to the desired coordinates.
   * 
   * We also added names to the meshes so that we can easily find them later, for intersections and
   * what not.
   */
  const leftArrow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true })
  );
  leftArrow.name = `LeftArrow`
  leftArrow.userData = {
    index: i === count - 1 ? 0 : i + 1
  };
  leftArrow.position.set(-1.75, 0, -4);
  artworkBaseNode.add(leftArrow);

  const rightArrow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshStandardMaterial({ map: rightArrowTexture, transparent: true })
  );
  rightArrow.name = `RightArrow`
  rightArrow.userData = {
    index: i === 0 ? count - 1 : i - 1
  };
  rightArrow.position.set(1.75, 0, -4);
  artworkBaseNode.add(rightArrow);
}

/**
 * No longer used as we turned off automatic rotation
 */
let lespeed = 0.004;

/**
 * Added an acceleration factor
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
const spotLight = new THREE.SpotLight( 0xffffff, 100.0, 10.0, 0.65, 1 );
spotLight.position.set(0, 5, 0);
spotLight.target.position.set(0, 0.5, -5);
scene.add( spotLight.target )
scene.add( spotLight );

/**
 * To add some more flare to the "art gallery", we will add a mirror on the floor like
 * freshly cleaned tiles on the museum floor.
 * 
 * We will initiate a Reflector object with a specific geometry and other options.
 * 
 * The color is used to attenuate the light or textures that are reflected. The width and height of the resulting texture
 * will be the same as the width and height of the canvas.
 */
const mirror = new Reflector(
  new THREE.CircleGeometry(10),
  {
    color: 0x303030,
    textureWidth: window.innerWidth,
    textureHeight: window.innerHeight,
  }
)
/**
 * We will rotate the mirror so that it is facing upwards and bring down the mirror to show it on the floor.
 * The mirror is then added to the scene as well. It is good to update the mirror when we resize the window.
 */
mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

/**
 * We would want to rotate the gallery every time the user clicks on the left or right arrow.
 * We will add a function to rotate the gallery.
 * 
 * We will rotate the gallery by the direction multiplied by 2 * PI / count,
 * which is the angle between each artwork, in radians.
 * 
 */
function rotateGallery(direction: -1 | 1, newIndex: number) {
  /**
   * This currently does not have any tweening/animation effect.
   * 
   * We will comment this out later.
   */
  // rootNode.rotateY(direction * (2 * Math.PI / count));

  const deltaY = direction * (2 * Math.PI / count);

  /**
   * For now we will use Tween but we can also use other animation libraries like GSAP.
   * 
   * We also add some opacity transitions to the title and artist text.
   */
  new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
      document.getElementById("title")!.style.opacity = "0";
    })
    .onComplete(() => {
      document.getElementById("title")!.innerText = images[newIndex].title;

      document.getElementById("title")!.style.opacity = "1";
    });
}

/**
 * Animation function that is called every frame.
 */
function animate() {
  /**
   * Temporary rotation to demonstrate the added artwork mesh on the screen
   * We commented it out to start working on raycasting.
   */
  // rootNode.rotation.y += lespeed;

  /**
   * We will update the tweens on the animate loop for the rotation of the gallery.
   */
  updateTween();
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

  /**
   * While it is not necessary to run this, we can just update the size of the mirror's render target
   * as well.
   */
  mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

/**
 * In order to allow interactions with the scene, we need to add a raycaster
 * to the scene. The raycaster will be used to detect intersections with the
 * objects in the scene.
 * 
 * For now, we will not check which mouse button is clicked.
 */
window.addEventListener('click', (e) => {
  const raycaster = new THREE.Raycaster();

  /**
   * We need to pass normalized device coordinates (NDC) to the raycaster.
   * NDC is a coordinate system that is normalized to the range of -1 to 1.
   * 
   * This formula is 
   * (e.clientX / window.innerWidth) * 2 - 1 - left (-1) to right (1)
   * -(e.clientY / window.innerHeight) * 2 + 1 - top (-1), bottom (1)
   * 
   * We are putting 0,0 in the middle of the screen instead of putting 0,0 on
   * the top left of the screen.
   */
  const mouseNDC = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  /**
   * We are basically setting the position from which we will casting the ray.
   */
  raycaster.setFromCamera(mouseNDC, camera);

  /**
   * We will check from the rootNode to see if there is an intersection.
   * We will set the second parameter to true so that we can recurvisely check
   * the intersections through rootNode's children.
   * 
   * intersectObjects will return the list of objects intersected, sorted by distance.
   * To easier check which object was intersected, we will name all the artwork
   * elements and the arrow as well.
   */
  const intersections = raycaster.intersectObjects(rootNode.children, true);
  if (intersections.length > 0) {
    const obj = intersections[0].object;
    const newIndex = <number>obj.userData.index;
    if (obj.name === "LeftArrow") {
      console.log("Left Arrow clicked");
      rotateGallery(-1, newIndex);
    } else if (obj.name === "RightArrow") {
      console.log("Right Arrow clicked");
      rotateGallery(1, newIndex);
    }
  }
});

document.getElementById("title")!.innerText = images[0].title;
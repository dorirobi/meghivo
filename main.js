import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function rad(deg){
  return deg * THREE.MathUtils.DEG2RAD;
}

function deg(rad){
  return rad * THREE.MathUtils.RAD2DEG;
}

const OPENED_RAD = rad(40);
const CLOSED_RAD = rad(180);

const PAGE_HEIGHT = 146;
const PAGE_WIDTH_QUARTER = 51;
const ANISOTROPY = 64;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });

let isOpened = true;

const getTextures = ()=> new Promise((resolve, reject)=>{
  const loader = new THREE.TextureLoader();
  THREE.DefaultLoadingManager.onLoad = ()=>resolve(textures);
  const textures = [
    "img/l_in.png",
    "img/l_out.png",
    "img/r_in.png",
    "img/r_out.png",
    "img/c_in.png",
    "img/c_out.png",
    "img/bg4.jpg",
  ].map(filename=> {
    var texture = loader.load(filename);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = ANISOTROPY;
    return texture;
  });
});

var textures = await getTextures();

// order to add materials: x+,x-,y+,y-,z+,z-
var lMaterial = [
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { map : textures[0] } ),
  new THREE.MeshBasicMaterial( { map : textures[1] } ),
];

var rMaterial = [
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { map : textures[2] } ),
  new THREE.MeshBasicMaterial( { map : textures[3] } ),
];

var cMaterial = [
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { color: 0xf7f7f7 } ),
  new THREE.MeshBasicMaterial( { map : textures[4] } ),
  new THREE.MeshBasicMaterial( { map : textures[5] } ),
];




scene.background = new THREE.Color( '#ffffff' );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app').appendChild( renderer.domElement );

renderer.pixelRatio = [1,2];
const bgCyl = new THREE.Mesh(
  new THREE.CylinderGeometry( 300, 300, 1000, 64 ),
  new THREE.MeshBasicMaterial( {map : textures[6], side: THREE.DoubleSide} )
);
scene.add(bgCyl);
/*
const bgA = new THREE.Mesh(
  new THREE.PlaneGeometry(2000,1500),
  new THREE.MeshLambertMaterial({ map : bgTexture })
);


/*const bgB = bgA.clone();
const bgC = bgA.clone();
const bgD = bgA.clone();*/

//bgA.position.z = -500;

/*bgB.position.x = -500;
bgB.rotation.y = rad(90);

bgC.position.x = +500;
bgC.rotation.y = rad(-90);

bgD.position.z = 500;
bgD.rotation.y = rad(180);
*/
//scene.add(bgA);
/*scene.add(bgB);
scene.add(bgC);
scene.add(bgD);
*/

const center = new THREE.Mesh(
  new THREE.BoxGeometry( 105, 146, 0.5 ),
  cMaterial
  //new THREE.MeshBasicMaterial( {color: 0x888888} )
);
center.name = "CENTER"
scene.add( center );

const left = new THREE.Mesh(
  new THREE.BoxGeometry( 52.5, 146, 0.5),
  lMaterial
  //new THREE.MeshBasicMaterial( {color: 0x550022} )
);
left.name = "LEFT";
left.position.x = -105/4
left.position.z = -0.25;
const leftPivot = new THREE.Group();

leftPivot.position.x = -105/2;
leftPivot.position.z = 0.25;
leftPivot.rotation.y =  CLOSED_RAD
leftPivot.rotationTarget = CLOSED_RAD;
leftPivot.rotating = false;
leftPivot.rotationDirection = 'none';

leftPivot.add( left );
scene.add( leftPivot );



const right = new THREE.Mesh(
  new THREE.BoxGeometry( 52.5, 146, 0.5 ),
  rMaterial
  //new THREE.MeshBasicMaterial( {color: 0x220077} )
);
right.name = "RIGHT";
right.position.x = 105/4;
right.position.z = -0.25;

const rightPivot = new THREE.Group();

rightPivot.position.x = 105/2;
rightPivot.position.z = 0.25;
rightPivot.rotation.y =  CLOSED_RAD*-1
rightPivot.rotationTarget = CLOSED_RAD*-1
rightPivot.rotating = false;
rightPivot.rotationDirection = 'none';

rightPivot.add( right );
scene.add( rightPivot );

left.position.y = 10;
right.position.y = 10;
center.position.y = 10;

const camera = new THREE.PerspectiveCamera(70, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);

camera.position.z = 180;

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance = 130;
controls.maxDistance = 180;
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;
controls.enablePan = false;

const ambientLight = new THREE.AmbientLight( /*0x404040*/0xffffff,1 ); // soft white light
scene.add( ambientLight );

var objects = [leftPivot, rightPivot];


function animate() {
  requestAnimationFrame( animate );

  objects.forEach((p) => {
    if(p.rotation.y != p.rotationTarget){
      if(!p.rotating){
        p.rotationDirection = p.rotation.y > p.rotationTarget ? "down" : "up";
        p.rotating = true;
      }
      switch(p.rotationDirection){
        case "down":
          if(p.rotation.y-0.03 < p.rotationTarget){
            p.rotation.y = p.rotationTarget;
            p.rotating = false;
          }else{
            p.rotation.y = p.rotation.y-0.03;
          }
          break;
        case "up":
          if(p.rotation.y+0.03 > p.rotationTarget){
            p.rotation.y = p.rotationTarget;
            p.rotating = false;
          }else{
            p.rotation.y = p.rotation.y+0.03;
          }
          break;
      }
    }
    renderer.render( scene, camera );
  });

}
animate();

document.getElementById('open').addEventListener('click', () =>{
  rightPivot.rotationTarget = OPENED_RAD*-1;
  leftPivot.rotationTarget = OPENED_RAD;
  isOpened = true;
});

document.getElementById('close').addEventListener('click', () =>{
  rightPivot.rotationTarget = CLOSED_RAD*-1;
  leftPivot.rotationTarget = CLOSED_RAD;
  setTarget('center');
  isOpened = false;
});

document.getElementById('left').addEventListener('click', () =>{
  setTarget('left');
});

document.getElementById('right').addEventListener('click', () =>{
  setTarget('right');
});

document.getElementById('center').addEventListener('click', () =>{
  setTarget('center');
});


/*
window.addEventListener('resize', resize)

function resize() {
  width = window.innerWidth
  height = window.innerHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  scene.traverse((obj) => {
    if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect)
  })
}
*/

function setTarget(target){
  if(isOpened){
    switch(target){
      case "center":
        controls.target = new THREE.Vector3(0, 0, 0);
        break;
      case "left":
        controls.target = new THREE.Vector3(-105/4*3, 0, 0);
        break;
      case "right":
        controls.target = new THREE.Vector3(105/4*3, 0, 0);
        break;
    }
    controls.update();
  }
}
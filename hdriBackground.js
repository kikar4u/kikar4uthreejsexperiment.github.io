
let scene, camera, fieldOfView = 70, aspectRatio, nearPlane, farPlane,
    renderer, container, control, mesh, stats, geometry;
var textureArray = { "projet1" : "testfelix&paul.jpg", "projet2" : "quattro_canti.jpg", "projet3": "test.jpg" };
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowsHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2);

let WIDTH, HEIGHT;
// Déclaration variables

window.addEventListener('load', init, false);

window.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('DOMMouseScroll', onMouseWheel, false);
window.addEventListener('mousemove', onMouseMove, false);
function init() {
  // Create scene
    createScene();
    // Create sphere contained textures
    createModel(textureArray["projet1"]);
    render();
    // Controls with mouse, no longer useful
    //createOrbit();
    statsPerf();
    resizeCanvas();
    // Update function
    loop();
    // get webgl information, only usefull for debug
    var can = document.getElementsByTagName("canvas")[0];
    var gl =    can.getContext('webgl');
    console.log(gl);

    gl.getParameter(gl.MAX_TEXTURE_SIZE); // 16 384
}

function onMouseWheel(){

    var fovMAX = fieldOfView -10;
    var fovMIN = 5;

    // WebKit
    if (event.wheelDeltaY) {

        camera.fov -= event.wheelDeltaY * 0.05;
        // Opera / Explorer 9
    } else if (event.wheelDelta) {
        camera.fov -= event.wheelDelta * 0.05;
        // Firefox
    } else if (event.detail) {
        //console.log("camera FOV " + camera.fov);
        camera.fov += event.detail * 1.0;
    }
    // limit for FOV
    camera.fov = Math.max( Math.min( camera.fov, fovMAX ), fovMIN );
    camera.projectionMatrix =    (new THREE.Matrix4()).makePerspective( camera.fov, window.innerWidth / window.innerHeight, 1, 1100, camera.near, camera.far );
    camera.updateProjectionMatrix();
// scrolling de page
    if (camera.fov == fovMAX && event.detail >= 3 || event.wheelDeltaY >= 3 ) {
      console.log("Scrolling : " + event.detail);
      mesh.geometry.dispose();
      mesh.material.dispose();
      scene.remove( mesh );
      createModel("studio_small_06.jpg");

    }
}
function onMouseMove(event){

  // get mouse position
    mouse.x = (event.clientX - windowsHalf.x);
    mouse.y = (event.clientY - windowsHalf.x);

    target.x = (1-mouse.x) * 0.002;
    target.y = (1-mouse.y) * 0.002;
    // rotate mesh and clamping values between -1 and 1
    mesh.rotation.x -= 0.05 * (target.y + mesh.rotation.x);
    mesh.rotation.y -= 0.05 * (target.x + mesh.rotation.y);

    mesh.rotation.z = 0;
    //console.log(" rotation x " + mesh.rotation.x + " Rotation y " + mesh.rotation.y + " rotation z " + mesh.rotation.z);
}
function createScene() {
    scene = new THREE.Scene();
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    aspectRatio = WIDTH / HEIGHT;
    nearPlane = 1;
    farPlane = 1000;
    camera = new THREE.PerspectiveCamera(fieldOfView, window.innerWidth / window.innerHeight, nearPlane, farPlane);
}

// don't work, maybe because it is based on older three js version
// function onDocumentMouseWheel(event) {
//   console.log("On entre dans le mousewheel");
//
//     // WebKit
//     if (event.wheelDeltaY) {
//
//         fieldOfView -= event.wheelDeltaY * 0.05;
//         // Opera / Explorer 9
//     } else if (event.wheelDelta) {
//         fieldOfView -= event.wheelDelta * 0.05;
//         // Firefox
//     } else if (event.detail) {
//         console.log("wheel delta y " + event.detail);
//         fieldOfView += event.detail * 1.0;
//     }
//     if (fieldOfView < 45 || fieldOfView > 90) {
//         fieldOfView = (fieldOfView < 45) ? 45 : 90;
//     }
//
//     console.log("field of view : " + fieldOfView);
//     camera.projectionMatrix = (new THREE.Matrix4()).makePerspective( fieldOfView, aspectRatio, 1, 1100, nearPlane, farPlane );
//     camera.updateProjectionMatrix();
// }

function resizeCanvas(){
    window.addEventListener('resize', () =>
    {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        camera.aspect = WIDTH / HEIGHT
        camera.updateProjectionMatrix()
        renderer.setSize(WIDTH, HEIGHT)
    })
}

function createModel(texturePath) {
    geometry = new THREE.SphereGeometry( 500, 60, 40 );
    let texture = new THREE.TextureLoader().load("hdri/" + texturePath );
    // stop resize on Chrome
    // BUG: Due to webGL limitations on Firefox, texture is resized
    // NOTE: Work on firefox 76, but framerate is quite low compared to Chrome based browser
    texture.minFilter = THREE.LinearFilter;
    let material = new THREE.MeshBasicMaterial( {
        map: texture,
        side: THREE.BackSide,
    } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.scale.set( - 1, 1, 1 );
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( 100, 1000, 100 );

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    scene.add( spotLight );
    scene.add( mesh );
    console.log(camera.position);
}
function statsPerf(){
  stats = new Stats();
  stats.showPanel(1);
  stats.showPanel(0);
  document.body.appendChild( stats.dom );
}
function render() {
    renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x004444);
    renderer.shadowMapEnabled = true;
    renderer.render(scene, camera);
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
}
// old way of moving camera
function createOrbit() {
    control = new THREE.OrbitControls(camera, renderer.domElement);
    control.object.position.set(0, 0, 200);
    control.minDistance = 0;
    control.enableZoom = false;
    // set to 10000
    control.maxDistance = 50;
    control.target.set(0, 0, 0);
    control.autoRotate = false;
    control.autoRotateSpeed = 3;
    control.rotateSpeed = 0.2;
    control.update();
}


function loop() {
    stats.begin();
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
    stats.end();

    //control.update();
}
// add mesh with fbx format
// var loader = new THREE.FBXLoader();
// loader.load( 'Models/deserteagleforsubstance.fbx', function ( object ) {
//   let material = new THREE.MeshBasicMaterial({
//   });
//   // changement de scale
//   object.scale.set(0.1,0.1,0.1);
//   object.castShadow = true;
//   object.receiveShadow = false;
//
//
//   scene.add( object );
//
// } );

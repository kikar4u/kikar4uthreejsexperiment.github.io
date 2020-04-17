
let scene, camera, fieldOfView = 70, aspectRatio, nearPlane, farPlane,
    renderer, container, control, mesh, stats, geometry;
var textureArray = ["hdri/testfelix&paul.jpg", "hdri/quattro_canti.jpg", "hdri/test.jpg"];
var imgArray = [];
var domBig_Container;

var currentProject = 0;
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowsHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2);

var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
var PI_2 = Math.PI / 2;

let WIDTH, HEIGHT;
var next;
// Déclaration variables




window.onload = function(){
//  domBig_Container[1].style.visibility = "visible";

}
  function preload(arrayOfImages) {

    var i = 0;
    $(arrayOfImages).each(function(){
        // $('<img/>')[0].src = this;

        // Alternatively you could use:
        currentImg = (new Image());
        currentImg.src = this;
        currentImg.onload = function(){
          i++;
          console.log("img" + i + "finie");
          if (i == arrayOfImages.length) {
            $("#world").css({"display" : "block"});
            $(".loading").remove();
            console.log("everything is done");
            $(".big_container").after().prepend("<div id=back><h2>BACK</h2></div><div id=next><h2>NEXT PROJET</h2></div>");
            $(".content").after().load("projects/project0.html");

            next = document.getElementById("next");
            back = document.getElementById("back");
            //console.log(next);
            back.addEventListener('click', function(){ changeProject("back") }, false);
            next.addEventListener('click', function(){ changeProject("next") } , false);
            window.addEventListener('load', init, false);
            window.addEventListener('wheel', onMouseWheel, false);
            window.addEventListener('DOMMouseScroll', onMouseWheel, false);
            window.addEventListener('mousemove', onMouseMove, false);
          }
        }


    });

}

// Usage:

preload(textureArray);

//
// $("#world").css({"display":"none"});
function init() {
  // Create scene
    createScene();
    // Create sphere contained textures
    createModel(textureArray[0],1);
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
  // maximum FOV, -10 so the user can zoom out
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
// scrolling
// old, may be deleted because no longer usefull
    if (camera.fov == fovMAX && event.detail >= 3 || event.wheelDeltaY >= 3 ) {
      console.log("Scrolling : " + event.detail);
    }
}
function fadeIn(calc){

  // document.getElementsByTagName("canvas")[0].style.animationName = "fadeToBlack";
  // use tween to fade between materials using material opacity

  // var tweenInnerHtml = new TWEEN.Tween(domBig_Container[currentProject]).to({
  //   opacity:1,
  //   visibility:"visible",
  // }, 2000)
  // .start();
  var tweenon = new TWEEN.Tween(mesh.material).to({
    opacity:0,
    // 2000 is time of animation, in ms
  }, 2000)
  .start()
  .onStart(function(){
    // opacity to 0 to create fade, 2s of duration
    $(".big_container").animate({opacity:0}, 2000, function(){
      // at the end, we change content
          $(".content").after().load("projects/project"+(currentProject)+".html");
      // and go back to normal opacity
          $(".big_container").animate({opacity:0.7}, 2000);
    });


  });
  // at end of animation, we change the material
  tweenon.onComplete(function(){
    // console.log("tween truc : " + tweenon);
    // console.log("on est dans le trucla");
    // delete old mesh
    mesh.geometry.dispose();
    // delete old material
    mesh.material.dispose();
    // remove mesh from scene
    scene.remove(mesh);

    // to go back and forth hdris, we use a array, and a counter to check at which projet the user is
    // this prevent out of range when going back and being in the first project at the same time
    if (calc == 1) {
      console.log("current projet if positif " + currentProject);
      // create object, using next hdris data from array , and rendering it in the scene
      // createModel(texture, startOpacity)
      createModel(textureArray[currentProject+1], 0);
      // we ++ the counter
      currentProject++;
      console.log("current projet if positif " + currentProject);
    }
    if (calc != 1){
      console.log("current projet " + currentProject);
      // same thing, but for going back in the array
      createModel(textureArray[currentProject-1], 0);
      currentProject--;
      console.log("current projet " + currentProject);
    }


    // fadeIn from 0 opacity to 1
    tweenon = new TWEEN.Tween(mesh.material).to({

      opacity:1,

    }, 2000)
    .start();
  });
}
function changeProject(eventType){
  // check which type of event occured, does the user want to go back, or to the next project ?
  if (eventType == "next") {
    console.log("array length" + textureArray.length);
    if (currentProject < textureArray.length - 1) {
      // animation transition + createModel
      // fadeIn(calc) calc is a int to know which way need to go in the array, back, or forth
      fadeIn(1);
    }
  }
  else if (eventType == "back") {
    if (currentProject > 0) {
      fadeIn(0);
      // console.log("on est dans le trucla");
      // mesh.geometry.dispose();
      // mesh.material.dispose();
      // scene.remove(mesh);
      // createModel(textureArray[currentProject-1]);
      // currentProject--;
    }
  }

}
// function to follow mouse mouvement and allow user to move the hdris
function onMouseMove(event){
  mouse.x = (event.clientX - windowsHalf.x);
  mouse.y = (event.clientY - windowsHalf.x);
  // get mouse position,
      target.x = (1-mouse.x) * 0.002; // 0.005 is speed
      target.y = (1-mouse.y) * 0.002;
      mesh.rotation.x -= 0.05 * (target.y + mesh.rotation.x);
      mesh.rotation.y -= 0.05 * (target.x + mesh.rotation.y);

    //Second method using quaternion
  // var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  // var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  // euler.setFromQuaternion(camera.quaternion);
  // euler.y -= movementX * 0.002;
  // euler.x -= movementY * 0.002;
	// euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

    // console.log("ça fonctionne ? ");
    // console.log(" rotation x " + target.x + " Rotation y " + target.y);
    //console.log(" rotation x " + mesh.rotation.x + " Rotation y " + mesh.rotation.y + " rotation z " + mesh.rotation.z);
}
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
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

function createModel(texturePath, opacity) {
    geometry = new THREE.SphereGeometry( 500, 60, 40 );
    // create the texture
    let texture = new THREE.TextureLoader().load(texturePath);
    console.log("texture path: " + texturePath);
    // stop resize on Chrome
    // BUG: Due to webGL limitations on Firefox, texture is resized
    // NOTE: Work on firefox 76, but framerate is quite low compared to Chrome based browser
    texture.minFilter = THREE.LinearFilter;
    let material = new THREE.MeshBasicMaterial( {
      // use parameters to change map and opacity, according to others actions
        map: texture,
        side: THREE.BackSide,
        // set transparency to true to have a black fade out
        transparent: true,
        opacity:opacity,
    } );
    // new mesh
    mesh = new THREE.Mesh( geometry, material );
    mesh.scale.set( - 1, 1, 1 );

    // Lights
    // var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // scene.add( light );
    // var spotLight = new THREE.SpotLight( 0xffffff );
    // spotLight.position.set( 100, 1000, 100 );
    // spotLight.castShadow = true;
    // spotLight.shadow.mapSize.width = 1024;
    // spotLight.shadow.mapSize.height = 1024;
    // spotLight.shadow.camera.near = 500;
    // spotLight.shadow.camera.far = 4000;
    // spotLight.shadow.camera.fov = 30;
    // scene.add( spotLight );
    // end Lights

    scene.add( mesh );
    console.log(camera.position);
}
// just some stats for optimization
// showPanel(int) 0:fps 1: latency 2: mb 3+ custom
function statsPerf(){
  stats = new Stats();
  stats.showPanel(1);
  stats.showPanel(1);
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
    TWEEN.update();
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

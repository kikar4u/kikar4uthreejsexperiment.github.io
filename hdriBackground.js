
let scene, scene2, camera, fieldOfView = 70, aspectRatio, nearPlane, farPlane,
    renderer, container, control, mesh, stats, geometry;
var blurredHDRI = ["hdri/blurred/blurred_concorde.jpg", "hdri/blurred/blurred_photo3.jpg", "hdri/blurred/blurred_utrillo.jpg", "hdri/blurred/blurred_felix.jpg", "hdri/blurred/blurred_quattro.jpg"];
// textureArray is where are stocked HDRI and images for each project.
// here we supposed we use only 1 img / hdri for each project on the landing page
// we have X projects so we have X image stocked in here, either hdri or simple image.
var textureArray = ["hdri/concorde_optimized.jpg", "img/PHOTO3_31072017.JPG", "img/ImageHomePageUtrillo.jpg", "hdri/testfelix&paul.jpg","hdri/quattro_canti_16k.jpg" ];
var rotationPerProject = [-90, 0, 0, 0, 0];
var imgArray = [];
var onmenu = false;
var imgProject = false;
var isMobile;
// var domBig_Container;
// let check = false;
let currentProject;
let targetProject;
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowsHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2);

let WIDTH, HEIGHT;
// var next;


preload(textureArray);

// loading image before load, prevent long loading during navigation
function preload(arrayOfImages) {

    var i = 0;
    $(arrayOfImages).each(function(){
      // caching each image
        currentImg = (new Image());
        currentImg.src = this;
        // when an image is finished loading :
        currentImg.onload = function(){
          // count nbrs of images loaded
          i++;
          // console.log("img" + i + "finie");

          if (i == arrayOfImages.length) {
            // if numbers of images correspond to the number of project / images
            // change main content to visible
            $("#world").css({"display" : "block"});
            // remove loading screen
            $(".loading").remove();
            //console.log("everything is done");
            // add project details
            // $(".big_container").after().prepend("<div id=back><h2>BACK</h2></div><div id=next><h2>NEXT PROJET</h2></div>");
            $(".content").after().load("projects/project0.html");


            // launch every step of rendering 3D view
            // create event listener used by 3D application
            // next = document.getElementById("next");
            // back = document.getElementById("back");
            // back.addEventListener('click', function(){ changeProject("back") }, false);
            // next.addEventListener('click', function(){ changeProject("next") } , false);
            window.addEventListener('load', init, false);
            window.addEventListener('wheel', onMouseWheel, false);
            window.addEventListener('DOMMouseScroll', onMouseWheel, false);
            document.getElementById('world').addEventListener('mousemove', onMouseMove, false);
            document.getElementById('menu').addEventListener('mousemove', onMouseMove, false);
            /*if the user clicks anywhere outside the select box,
            then close all select boxes:*/
            document.addEventListener("click", closeAllSelect);
            window.addEventListener("touchmove", onFingerMove, false);
            window.addEventListener("mousemove", movingImg, false);
            displayMenuProject(textureArray);

            // addAudio(textureArray[0]);
          }

        }

    });


}

function init() {
  // Create scene
    currentProject = 0;
    targetProject = 0;
    createScene();
    // Create sphere contained textures
    createModel(textureArray[0],1, rotationPerProject[0]);
    scene.add( mesh );
    render(document.getElementById('world'), 'canva');


    // Controls with mouse, no longer useful
    //createOrbit();
    //statsPerf();
    resizeCanvas();
    // Update function
    console.log(currentProject);
    loop();

    // get webgl information, only usefull for debug
    var can = document.getElementsByTagName("canvas")[0];
    var gl =    can.getContext('webgl');
    // console.log(gl);

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

}
// fadeIn()
// calc = bool used before using non linear switch between projects
// e string used to create blur with menu
function fadeIn(calc, e){

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
      // fade whenever there is no hdri but an image as project cover
      $(".projectImg").animate({opacity:0}, 2000);
      $(".big_container").animate({opacity:0}, 2000, function(){
        // at the end, we change content
            $(".content").after().load("projects/project"+(currentProject)+".html");
            // we load specific content using external html page, depending on which project is needed

            // and go back to normal opacity
            $(".big_container").animate({opacity:1}, 2000);
            // fade img to 1
            $(".projectImg").animate({opacity:1}, 2000);
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
    var patt = /img/i;
    // regexp used to track if it's an image or and hdri
    // to go back and forth hdris, we use a array, and a counter to check at which projet the user is
    // this prevent out of range when going back and being in the first project at the same time
    if (calc == 1) {
      //console.log("current projet if positif " + currentProject);
      // create object, using next hdris data from array , and rendering it in the scene
      // createModel(texture, startOpacity)

      if (patt.test(textureArray[targetProject])) {

        //console.log("Okay ! on est dans la regex");
        $("#canva").css({"visibility":"hidden"});
        // console.log("on arrive au hidden ici");
        $("#world").css({"backgroundImage": "url("+textureArray[targetProject]+")"});

      }
      else{

        $("canvas").css({"visibility":"visible"});
        if (e != null && e == "blurMenu") {
            createModel(blurredHDRI[currentProject], 1, 0);
            // console.log("YEET" + currentProject);
        }
        else{
          createModel(textureArray[targetProject], 0, rotationPerProject[targetProject]);
          //console.log("tableau :" + textureArray[targetProject]);
        }
          scene.add( mesh );
      }


      // we ++ the counter
      currentProject = targetProject;

      // console.log("current projet if positif " + currentProject);
    }


    // fadeIn from 0 opacity to 1 for material (hdri)
    tweenon = new TWEEN.Tween(mesh.material).to({

      opacity:1,

    }, 2000)
    .start();
  });

}
// fadeIn variation used for menu
// main difference is animation time and control of hdri
function blurHdri(calc, e){
  var tweenon = new TWEEN.Tween(mesh.material).to({
    opacity:0,
    // 2000 is time of animation, in ms
  }, 2000)
  .start()
  .onStart(function(){
    $(".projectImg").animate({opacity:0}, 500);
    $(".big_container").animate({opacity:0}, 500, function(){
      // at the end, we change content
          // $(".content").after().load("projects/project"+(currentProject)+".html");


      // and go back to normal opacity
          $(".big_container").animate({opacity:1}, 500);
          // fade img to 1
          $(".projectImg").animate({opacity:1}, 500);
    });
    // console.log("tween truc : " + tweenon);
    // console.log("on est dans le trucla");
    // delete old mesh
    mesh.geometry.dispose();
    // delete old material
    mesh.material.dispose();
    // remove mesh from scene
    scene.remove(mesh);
    var patt = /img/i;
    // regexp used to track if it's an image or and hdri
    // to go back and forth hdris, we use a array, and a counter to check at which projet the user is
    // this prevent out of range when going back and being in the first project at the same time
    if (calc == 1) {
        if (e != null && e == "blurMenu") {

            createModel(blurredHDRI[currentProject], 1, 0);
            console.log("YEET" + currentProject);
            $("#canva").css({"visibility" : "visible"});
        }
        else{
          createModel(textureArray[targetProject], 0, rotationPerProject[targetProject]);
          //console.log("tableau :" + textureArray[targetProject]);
        }
          scene.add( mesh );



      currentProject = targetProject;

      // console.log("current projet if positif " + currentProject);
    }


    // fadeIn from 0 opacity to 1 for material (hdri)
    tweenon = new TWEEN.Tween(mesh.material).to({

      opacity:1,

    }, 1)
    .start();
  });
}
function changeProject(eventType, id){
  renderer.renderLists.dispose();

  targetProject = Number(id);
  // id is changed to int
  if (eventType == "change") {
    fadeIn(1);
  }
  else if(eventType == "menu"){
    console.log(eventType + "blurhdri");
    blurHdri(1, "blurMenu");
  }

}
function onFingerMove(event){
  event.preventDefault();
  // createOrbit(minDistance, maxDistance, enableZoom, autoRotate, moveSpeed)
  createOrbit(10, 50, true, false, 0.5);
  // mouse.x = (event.touches[0].pageX - windowsHalf.x);
  // mouse.y = (event.touches[0].pageY - windowsHalf.x);
  // // get mouse position,
  //     target.x = (1-mouse.x) * 0.005; // 0.005 is speed
  //     target.y = (1-mouse.y) * 0.002;
  //     mesh.rotation.x -= 0.05 * (target.y + mesh.rotation.x); //vertical rotation
  //     mesh.rotation.y -= 0.05 * (target.x + mesh.rotation.y); //horizontal rotation
  // console.log("levent du doigt" + event.touches[0].clientX);
}
// function to follow mouse mouvement and allow user to move the hdris

function onMouseMove(event){

  $("#test").mouseover(function(){
    onmenu = true;
  });
  $("#test").mouseout(function(){
    onmenu = false;
  })
if (!onmenu) {
  mouse.x = (event.screenX - windowsHalf.x);
  mouse.y = (event.screenY - windowsHalf.x);
  // get mouse position,
  target.x = (1-mouse.x) * 0.002; // 0.005 is speed
  target.y = (1-mouse.y) * 0.002;
  mesh.rotation.x -= 0.05 * (target.y + mesh.rotation.x);
  mesh.rotation.y -= 0.05 * (target.x + mesh.rotation.y);
}
// else{
//   console.log("ah ? !");
//   backtopos();
// }





}
function backtopos(){
  mouse.x = 0;
  mouse.y = 0;
  new TWEEN.Tween(mesh.rotation)
    .to( {
            x: 0,
            y: rotationPerProject[currentProject] * Math.PI / 180
        }, 500 )
    .start();


}
function movingImg(e){
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// mobile verification, because moving image is based on mouse movement, it is not useful to use on mobile
// moreover, changing background position cause non-responsive image on mobile
  if (!isMobile) {
    var mouseXimg = e.pageX - $('#world').offset().left;
    var mouseYimg = e.pageY - $('#world').offset().top;
    var totalX = $('#world').width();
    var totalY = $('#world').height();
    var centerX = totalX / 2;
    var centerY = totalY / 2;
    var shiftX = centerX - mouseXimg;
    var shiftY = centerY - mouseYimg;
    // var startX = ($(document).width() / 2) ;
    // var startY = ($(document).height() / 2);
    var startX =-15;
    var startY =-15;
    // $('#world').css({"background-position-x": -e.offsetX+"px", "background-position-y" : -e.offsetY + "px"});
    $('#world').css({ 'background-position-x': startX + (shiftX/55) + 'px', 'background-position-y' : startY + (shiftY/55) + 'px' });
  }
  else{
    //console.log("do nothing");
  }

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


function resizeCanvas(){
    window.addEventListener('resize', () =>
    {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(WIDTH, HEIGHT);
    })
}

function createModel(texturePath, opacity, rotation ) {
    geometry = new THREE.SphereGeometry( 500, 60, 40 );
    // create the texture
    let texture = new THREE.TextureLoader().load(texturePath);
    //console.log("texture path: " + texturePath);
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
    if (rotation != null) {
      mesh.rotation.y = rotation * Math.PI / 180;
    }

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


    //console.log(camera.position);

}
// just some stats for optimization
// showPanel(int) 0:fps 1: latency 2: mb 3+ custom
function statsPerf(){
  stats = new Stats();
  stats.showPanel(1);
  stats.showPanel(1);
  document.body.appendChild( stats.dom );
}

function render(container, id) {
    renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x004444);
    renderer.shadowMap.enabled = true;
    // renderer.render(scene, camera);
    container.appendChild(renderer.domElement);
    renderer.domElement.id = id;
    var canvas = document.getElementById(id);

}
// old way of moving camera
function createOrbit(minDistance, maxDistance, enableZoom, autoRotate, speed) {
    control = new THREE.OrbitControls(camera, renderer.touchmove);
    control.object.position.set(0, 0, 200);
    control.minDistance = minDistance;
    control.enableZoom = enableZoom;
    // set to 10000
    control.maxDistance = maxDistance;
    control.target.set(0, 0, 0);
    control.autoRotate = autoRotate;
    control.autoRotateSpeed = 3;
    control.rotateSpeed = speed;
    control.update();
}


function loop() {
    //stats.begin();

    requestAnimationFrame(loop);

    TWEEN.update();
    // composer.render(scene, camera);
    renderer.render(scene, camera);
    // composer.render(scene, camera);
    //stats.end();
    //control.update();
}
function hideAllProjectsElements(type){
  if (type == "show") {
    $("#world").children().show();
    $(".custom-select").show();
    $(".bar").show();
    if(isMobile){
          $("#test").hide();
    }

  }
  else{
    $("#world").children().hide();

    $(".custom-select").hide();

    $(".bar").hide();

    $("#canva").show();
  }

}
function openNav(){

  // display and animate left menu
  hideAllProjectsElements();
  changeProject("menu", currentProject);

  // in Fadein change To fade to blurred hdris

  if ($(window).width < 1080) {
    document.getElementById('menu').style.width="100%";
  }
  else{
    document.getElementById('menu').style.width = "100%";
  }
}
function closeNav(){
    console.log("target : " + targetProject);
    hideAllProjectsElements("show");

    changeProject("change", currentProject);
    console.log(currentProject);

    document.getElementById('menu').style.width ="0";
}
function changeTextMenu(classToDisplay){
// used to switch between paragraph in the "about menu" (left menu)
  $(".menuContent").animate({opacity:0}, 900, function(){
      $(".menuContent").css({"display":"none"});

      $("."+classToDisplay).css({"display" : "block"});
  });
      $(".menuContent").animate({opacity:1}, 900);


}
// get every title from the projects html file and then add it to the index menu, making menu dynamic
function displayMenuProject(array){

    $(".selectorContainer").append("<h4 class='menuLegend'>Menu</h4>");
    for (var i = 0; i < array.length; i++) {
      // console.log($('#'+i).load( "projects/project0.html"));
      isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      // mobile version of the menu
      if (isMobile) {
              $(".mobileSelectorContainer").append("<a onclick=changeProject('change',"+ i + ")><span id=Mobile"+ i +" class='mobileTitleMenu'></span></a>");
              // HACK: somehow, jQuery selector don't work unless i is changed to string using a var instead of doing $("#"+i)
              var toString = "#Mobile" + i;
              $(toString).load( "projects/project"+i+".html h1", function(){
                // change h1 title (from projectx.html) to simple text.
                  $(this).find("h1").replaceWith($(this).text());
              });

      }
      $(".selectorContainer").append("<a onclick=changeProject('change',"+ i + ")><span id="+ i +" class='titleMenu'></span><span class='dot' onmouseover = 'animationMenu("+ i +", 1)' onmouseout = 'animationMenu("+ i +", 0)'></span></a>");
      var toString = "#" + i;
      $(toString).load( "projects/project"+i+".html h1", function(){
          $(this).find("h1").replaceWith($(this).text());
      });

    }
      $(".selectorContainer").append("<a href='http://www.artofcorner.fr/portfolio/'><span id=portfolio class='titleMenu'>portfolio</span><span class='dot' onmouseover=animationMenu('portfolio',1) onmouseout=animationMenu('portfolio',0)></span></a>");
      if (isMobile) {
        $(".mobileSelectorContainer").append("<a href='http://www.artofcorner.fr/portfolio/'><span id=MobilePortfolio class='mobileTitleMenu'>Portfolio</span></a>");
      }
}
function animationMenu(id, opacityValue){
  // animation using to display menu title for each project
  $("#"+id).animate({opacity:opacityValue}, 400);
}
function playAudio(project){
  audio = document.getElementById("audio");
 // check if audio is played
  if (audio.duration > 0 && !audio.paused) {
    // change volume icone depending on audio status
    $("#Capa_1").css({"display":"initial" });
    $("#Capa_2").css({"display":"none"});
      audio.pause();

  } else {
    $("#Capa_1").css({"display":"none" });
    $("#Capa_2").css({"display":"initial"});

    audio.play();
    audio.volume = 0.5;

  }

}
function changeText(eventType){

  // animation used to switch between credits and description for project
  if (eventType == "content_credits") {
    // animate(animated css type, speed, callback function)
    $(".content_description").animate({opacity:0}, 1000, function(){

    });
          $(".content_description").css({"display": "none"});
          $(".content_credits").css({"display": "initial"});
          $(".content_credits").animate({opacity:1}, 1000, function(){

    });
  }
  else{
          $(".content_credits").animate({opacity:0}, 1000, function(){

    });
          $(".content_credits").css({"display": "none"});
          $(".content_description").css({"display": "initial"});
          $(".content_description").animate({opacity:1}, 1000, function(){

    });
  }
}
// custom dropdown menu for language
var x, i, j, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
for (i = 0; i < x.length; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = "FR";
  x[i].appendChild(a);
  /*for each element, create a new DIV that will contain the option list:*/
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < selElmnt.length; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, i, k, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
}
function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

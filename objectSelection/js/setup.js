"use strict"

/**
This version uses a THREE.Raycaster to get the object under the mouse
when the user first clicks. Later versions should use ...

$scene.clara('registerTool', {
  name: "treatClick"
, click: <nameOfFunction>
})

...  and get the details of the object that was clicked from the
event that is passed to the function.

Modifications are currently applied directly to the transform matrix
of the manipulated object. Later versions will:
* modify a separate matrix in world space for the manipulation
* create a local-space matrix for each manipulated object
* use ctx() to update the local matrix of each object reactively

TODO
* Update camera viewport when window is resized, or views are changed.
**/

function initialize() {
  window.removeEventListener("load", initialize, false)

  var context = window.context || (window.context = {})

  // Shared via context
  var scene = context.scene = new THREE.Scene()
  // In camera.js, custom.js, manipulator.js
  var camera // camera.js, manipulator.js
  var cameras = context.cameras = [] // camera.js

  // local only
  var WIDTH = window.innerWidth
  var HEIGHT = window.innerHeight

  ;(function createPerspectiveCamera(){
    var FOV = 45
    var ASPECT = WIDTH / HEIGHT
    var NEAR = 1
    var FAR = 3000

    camera = context.camera = new THREE.PerspectiveCamera(
      FOV
    , ASPECT
    , NEAR
    , FAR
    )

    camera.position.z = 100
    camera.viewport = { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    cameras.push(camera)
  })()

  ;(function initializeRenderer(){
    var renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0xEEEEFF))
    renderer.setSize(WIDTH, HEIGHT)
    renderer.autoClear = false;

    document.getElementById("WebGL-output").appendChild(renderer.domElement)

    ;(function render() {
      var viewport
      renderer.setViewport( 0, 0, WIDTH, HEIGHT );
      renderer.clear();

      cameras.forEach(function (camera) {
        viewport = camera.viewport // custom property
        renderer.setViewport(
          viewport.x
        , viewport.y
        , viewport.width
        , viewport.height
        )
        renderer.render(scene, camera)
      })

      requestAnimationFrame(render)
    })()
  })()

  ;(function createCameraController(){
    var viewport = {
      x: WIDTH - 100
    , y: HEIGHT - 100
    , width: 100
    , height: 100
    }
    var circle = {
      x: WIDTH - 50
    , y: 50
    , radius: 50
    }
    
    context.addCameraController(viewport, circle)
  })()

  context.createCustomScene()
}

window.addEventListener("load", initialize, false)
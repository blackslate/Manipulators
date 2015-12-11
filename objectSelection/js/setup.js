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

  ;(function createCameraController(){
    var viewport = {
      x: context.WIDTH - 100
    , y: context.HEIGHT - 100
    , width: 100
    , height: 100
    }
    var circle = {
      x: context.WIDTH - 50
    , y: 50
    , radius: 50
    }
    
    context.addCameraController(viewport, circle)
  })()

  context.createCustomScene()
}

window.addEventListener("load", initialize, false)
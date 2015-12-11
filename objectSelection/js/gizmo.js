"use strict"

/*
TODO:
Create gizmo with elements for
- Rotation
- Translation
- Scale

Place gizmo at a fixed distance from the camera, on a line through the pivot point
Update position of gizmo as camera settings change.
- Position (Pan, Dolly)
- Rotation
 */

;(function gizmos(window){
  var context = window.context || (window.context = {})
  var gizmo
  var gizmoCamera
  var gizmoObject

  var scene = new THREE.Scene()
  var camera = context.camera

  var rotationMatrix = new THREE.Matrix4()
  var objectPosition = new THREE.Vector3()
  var actions = {}
  var parts = {}
  var part

  context.getGizmo = function getGizmo(object){
    var camera = context.camera
    var action = context.action
    var basis = context.basis

    if (!gizmo) {
      createGizmo()
    }

    if (object instanceof Array) {
      if (object.length) {
        gizmoObject = object[0]
      } else {
        gizmoObject = null
      }
    } else if (object) {    
      gizmoObject = object
    }

    if (gizmoObject) {
      showGizmoParts(action)
      gizmo.visible = true
      setTimeout(placeGizmo, 1)
    } else {
      gizmo.visible = false
    }

    function createGizmo() {
      var radius = 1
      var edges = 36
      var size = 256
      var geometry
        , material
        , part
      var whiteMaterial = new THREE.MeshBasicMaterial( {
        color: 0xffffff
      , transparent: true
      , opacity: 0.8
      } )
      var redMaterial = new THREE.MeshBasicMaterial( {
        color: 0xff0000
      , transparent: true
      , opacity: 0.8
      , side: THREE.DoubleSide
      } )
      var greenMaterial = new THREE.MeshBasicMaterial( {
        color: 0x00ff00
      , transparent: true
      , opacity: 0.8
      , side: THREE.DoubleSide
      } )
      var blueMaterial = new THREE.MeshBasicMaterial( {
        color: 0x0000ff
      , transparent: true
      , opacity: 0.8
      , side: THREE.DoubleSide
      } )
      var yellowMaterial = new THREE.MeshBasicMaterial( {
        color: 0xffff00
      , side: THREE.DoubleSide
      } )

      gizmo = new THREE.Object3D()
      gizmo.name = "gizmo"

      ;(function createCamera(){
        gizmoCamera = new THREE.OrthographicCamera(
         -radius, radius
        , radius,-radius
        ,-radius, radius
        );
        gizmoCamera.viewport = { x: 0, y: 0, width: size, height: size}
        gizmoCamera.scene = scene
        gizmo.add(gizmoCamera)
        context.cameras.push(gizmoCamera)
      })()

      ;(function rotateGizmo(){
        var rotateGizmo = new THREE.Object3D()
        var rings = new THREE.Object3D()
        rings.matrixAutoUpdate = false

        gizmo.add(rotateGizmo)
        rotateGizmo.add(rings)
        parts.rotate = rings
        actions.rotate = rotateGizmo

        // x-, y- and z-axis rings
        geometry = new THREE.TorusGeometry(radius*.7, radius*.01, 3, edges);
        part = new THREE.Mesh( geometry, redMaterial )
        part.name = "rotateX"
        part.rotation.y = Math.PI / 2
        rings.add(part)

        part = new THREE.Mesh( geometry, greenMaterial )
        part.name = "rotateY"
        part.rotation.x = -Math.PI / 2
        rings.add(part)

        part = new THREE.Mesh( geometry, blueMaterial )
        part.name = "rotateZ"
        rings.add(part)
     
        // viewplane ring
        geometry = new THREE.TorusGeometry(radius, radius*.01, 3, edges)
        part = new THREE.Mesh( geometry, whiteMaterial )
        part.name = "rotateView"
        part.rotation.x = Math.PI
        rotateGizmo.add(part)
        
        // trackball sphere
        geometry = new THREE.SphereGeometry( radius/10, edges, edges )
        part = new THREE.Mesh( geometry, whiteMaterial )
        part.name = "rotateBall"
        rotateGizmo.add(part)
      })()

      scene.add(gizmo)
      context.addCameraListener(placeGizmo)
      context.mouseActions.addActionListener("mousedown", startDrag, 10)
    }

    function setGizmoBasis(basis) {

    }

    function showGizmoParts(action) {
      var partKeys = Object.keys(actions)
      partKeys.forEach(function (partKey) {
        actions[partKey].visible = (partKey === action)
      })

      part = parts[action]
    }

    function placeGizmo() {
      if (!gizmo.visible) {
        return
      }

      camera.updateMatrixWorld()
      camera.setWorldViewProperties() // custom method

      gizmoObject.updateMatrixWorld()
      objectPosition.setFromMatrixPosition(gizmoObject.matrixWorld)
      objectPosition.applyProjection(camera.worldToViewMatrix)

      gizmoCamera.viewport.x = (
        (1 + objectPosition.x) * camera.viewport.width
          - gizmoCamera.viewport.width
      ) / 2
      gizmoCamera.viewport.y = (
        (1 + objectPosition.y) * camera.viewport.height
          - gizmoCamera.viewport.height
      ) / 2

      if (part) {
        part.matrix.extractRotation(rotationMatrix.multiplyMatrices(
          camera.matrixWorldInverse
        , gizmoObject.matrixWorld
        ))
      }
    }

    function startDrag(event) {
      var action = context.action
      var targets = actions[action] ? [actions[action]] : []
      var targetData = context.getTargetData(
        event
      , gizmoCamera
      , targets
      ) // may be undefined

      if (!targetData) {
        return false
      }

      switch (targetData.object.name) {
        case "rotateX":

        break
        case "rotateY":

        break
        case "rotateZ":

        break
        case "rotateBall":

        break
        case "rotateView":

        break
      }

      console.log(targetData.object.name)

      return true
    }
  }
})(window)

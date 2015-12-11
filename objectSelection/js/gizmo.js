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

var rings
var selection

;(function gizmos(window){
  var context = window.context || (window.context = {})
  var gizmo
  var gizmoCamera
  //var rings
  var scene = new THREE.Scene()
  var camera = context.camera
  var objectPosition = new THREE.Vector3()
  var ringMatrix = new THREE.Matrix4()

  context.getGizmo = function getGizmo(object, camera, action, basis){
    if (!gizmo) {
      createGizmo()
    }

    setGizmoBasis(basis)
    showGizmoParts(action)
    placeGizmo()
    context.addCameraListener(placeGizmo)
 
    return gizmo

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
      gizmoCamera = new THREE.OrthographicCamera(
       -radius, radius
      , radius,-radius
      ,-radius, radius
      );
      gizmoCamera.viewport = { x: 0, y: 0, width: size, height: size}
      gizmoCamera.scene = scene
      gizmo.add(gizmoCamera)
      context.cameras.push(gizmoCamera)

      // trackball sphere
      geometry = new THREE.SphereGeometry( radius/10, edges, edges )  
      part = new THREE.Mesh( geometry, whiteMaterial );
      gizmo.add(part)
   
      // viewplane ring
      geometry = new THREE.RingGeometry(radius, radius*.98, edges);
      part = new THREE.Mesh( geometry, whiteMaterial );
      part.rotation.x = Math.PI
      gizmo.add(part)

      // x-, y- and z-axis rings
      rings = new THREE.Object3D()
      rings.matrixAutoUpdate = false
      geometry = new THREE.TorusGeometry(radius*.7, radius*.01, 3, edges);
      part = new THREE.Mesh( geometry, redMaterial )
      part.rotation.y = Math.PI / 2
      rings.add(part)

      part = new THREE.Mesh( geometry, greenMaterial )
      part.rotation.x = -Math.PI / 2
      rings.add(part)

      part = new THREE.Mesh( geometry, blueMaterial )
      rings.add(part)

      gizmo.add(rings)
      scene.add(gizmo)

      setTimeout(placeGizmo, 1)
    }

    function setGizmoBasis(basis) {

    }

    function showGizmoParts(action) {

    }

    function placeGizmo() {
      camera.updateMatrixWorld()
      camera.setWorldViewProperties() // custom method

      object.updateMatrixWorld()
      objectPosition.setFromMatrixPosition(object.matrixWorld)
      objectPosition.applyProjection(camera.worldToViewMatrix)

      gizmoCamera.viewport.x = (
        (1 + objectPosition.x) * camera.viewport.width
          - gizmoCamera.viewport.width
      ) / 2
      gizmoCamera.viewport.y = (
        (1 + objectPosition.y) * camera.viewport.height
          - gizmoCamera.viewport.height
      ) / 2

      rings.matrix.extractRotation(ringMatrix.multiplyMatrices(
        camera.matrixWorldInverse
      , object.matrixWorld
      ))
    }
  }
})(window)

"use strict"

/*
TODO:
Create gizmo with elements for
- Rotation
- Translation
- Scale

Place gizmo at a fixed distance from the camera, on a line through the pivot point
 */

;(function gizmos(window){
  var context = window.context || (window.context = {})
  var gizmos = []
  var objects = []
  var gizmo

  context.getGizmo = function getGizmo (object, action, basis) {
    var index = objects.indexOf(object)
    if (index < 0) {
      createGizmo()
      gizmos.push(gizmo)
      object.push(object)
    } else {
      gizmo = gizmos[index]
    }

    function createGizmo() {
      gizmo = new THREE.Object3D()

      // trackball sphere

      // viewplane ring

      // x-, y- and z-axis rings
    }
  }
})(window)
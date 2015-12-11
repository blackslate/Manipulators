"use strict"

;(function helpers(){
  var context = window.context || (window.context = {})

  // Patch for THREE.Vector3
  THREE.Vector3.prototype.mapToRayLine = function ( ray ) {
    this.sub( ray.origin )
    var directionDistance = this.dot( ray.direction );
    this.copy( ray.direction ).multiplyScalar( directionDistance )
         .add( ray.origin )
  }

  // Patch for THREE.Camera
  THREE.Camera.prototype.setWorldViewProperties = function () {
    var viewToWorldMatrix = this.viewToWorldMatrix
        || (this.viewToWorldMatrix = new THREE.Matrix4())
    var worldToViewMatrix = this.worldToViewMatrix
        || (this.worldToViewMatrix = new THREE.Matrix4())
    var worldPosition = this.worldPosition
        || (this.worldPosition = new THREE.Vector3())

    viewToWorldMatrix.multiplyMatrices(
      this.matrixWorld
    , viewToWorldMatrix.getInverse(this.projectionMatrix)
    )

    worldToViewMatrix.multiplyMatrices(
      this.projectionMatrix
    , worldToViewMatrix.getInverse(this.matrixWorld)
    )

    this.worldPosition.setFromMatrixPosition( this.matrixWorld )
  }

  context.setClientPoint = function (event, clientPoint) {
    clientPoint.x = event.clientX || event.touches[0].clientX
    clientPoint.y = event.clientY || event.touches[0].clientY
  }

  context.addListener = function (element, key, method) {
    switch (key) {
      case "start":
        element.addEventListener("mousedown", method, false)
        element.addEventListener("touchstart", method, false)
      break
      case "move":
        element.addEventListener("mousemove", method, false)
        element.addEventListener("touchmove", method, false)
      break
      case "stop":
        element.addEventListener("mouseup", method, false)
        element.addEventListener("touchend", method, false)
        element.addEventListener("touchcancel", method, false)
      break
    }
  }

  context.removeListener = function (element, key, method) {
    switch (key) {
      case "start":
        element.removeEventListener("mousedown", method, false)
        element.removeEventListener("touchstart", method, false)
      break
      case "move":
        element.removeEventListener("mousemove", method, false)
        element.removeEventListener("touchmove", method, false)
      break
      case "stop":
        element.removeEventListener("mouseup", method, false)
        element.removeEventListener("touchend", method, false)
        element.removeEventListener("touchcancel", method, false)
      break
    }
  }

  context.getTargetData = (function () {
    var clientPoint = {}
    var viewPoint = new THREE.Vector3()
    var raycaster = new THREE.Raycaster()

    return function getTargetData (event, camera, selectableObjects) {
      var viewport = camera.viewport
      var intersects // array of intersection data objects
      var targetData // intersection data object | undefined
      var target

      context.setClientPoint(event, clientPoint)
      clientPoint.x -= viewport.x
      clientPoint.y -= (context.HEIGHT - viewport.y - viewport.height)
      viewPoint.x = (clientPoint.x / viewport.width) * 2 - 1
      viewPoint.y = 1 - (clientPoint.y / viewport.height) * 2

      raycaster.setFromCamera( viewPoint, camera )
      intersects = raycaster.intersectObjects(selectableObjects, true)

      targetData = intersects[0] // may be undefined

      if (targetData) {
        target = targetData.object
        while (target && selectableObjects.indexOf(target) < 0) {
          target = target.parent
        }
        targetData.target = target
      }
      
      return targetData
    }
  })();
})(window)
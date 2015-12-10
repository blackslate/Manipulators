"use strict"

// Patch for THREE
THREE.Vector3.prototype.mapToRayLine = function ( ray ) {
  this.sub( ray.origin )
  var directionDistance = this.dot( ray.direction );
  this.copy( ray.direction ).multiplyScalar( directionDistance )
       .add( ray.origin )
}


;(function defineMode(){
  var context = window.context || (window.context = {})

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
})(window)
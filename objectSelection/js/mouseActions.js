"use strict";

/**
 The MouseActions object assembles in one place all the actions that can be started by a mousedown event, depending on the interface
 choices made by the user (action, basis, constraint, ...).

 It also provides an addEventListener function, which can be used to
 check for priority actions.
 **/

;(function createMouseActions(window) {
  var context = window.context || (window.context = {})
  var actions = context.mouseActions = {}
  var events = actions.events = {}
  
  var targetData
  var target

  var camera // context.camera
  var viewWidth // camera.viewport.width
  var viewHeight // camera.viewport.height
  var cameraPosition = new THREE.Vector3()
  var viewToWorldMatrix = new THREE.Matrix4()

  var basisMatrix = new THREE.Matrix4()
  var xAxis = new THREE.Vector3()
  var yAxis = new THREE.Vector3()
  var zAxis = new THREE.Vector3()

  var nearPoint = new THREE.Vector3(0, 0, -1)
  var farPoint = new THREE.Vector3(0, 0, 1)
  var axisPoint = new THREE.Vector3()
  var planePoint = new THREE.Vector3()

  var plane = new THREE.Plane()
  var moveRay = new THREE.Ray()
  var mouseRay = new THREE.Ray()

  actions.select = function select(event) {
    
  }

  actions.translate = function translate( targetData, selection ) {
    if (!(targetData)) {
      // Nothing to translate
      return
    }

    target = targetData.target
    setCamera()
    setBasis()

    window.addEventListener( 'mousemove', dragToTranslate, false )
    window.addEventListener( 'mouseup', stopDrag, false )

    ;(function initializeTranslation() {
      axisPoint.copy(targetData.point)
      selection.forEach(function setDragOffset(selectedObject) {
        var dragOffset = selectedObject.dragOffset

        dragOffset
        ? null
        : dragOffset = selectedObject.dragOffset = new THREE.Vector3()

        dragOffset.setFromMatrixPosition(selectedObject.matrixWorld)
                  .sub(axisPoint)
      })     

      switch (context.freedom) {
        default: // case "": case "xyz":
          createConstraintPlane(camera.getWorldDirection())
        break

        case "x":
          createAxisPlane(xAxis)
        break
        case "y":
          createAxisPlane(yAxis)
        break
        case "z":
          createAxisPlane(zAxis)
        break

        case "yz":
          createConstraintPlane(xAxis)
        break
        case "xz":
          createConstraintPlane(yAxis)
        break
        case "xy":
          createConstraintPlane(zAxis)
        break
      }
    })()

    function dragToTranslate(event) {
      setMouseRay(event)
      mouseRay.intersectPlane(plane, planePoint)

      switch (context.freedom) {
        case "x":
        case "y":
        case "z":
          planePoint.mapToRayLine(moveRay)
        break
      }

      selection.forEach(function translate(selectedObject) {
        selectedObject.position.copy(selectedObject.dragOffset)
                               .add(planePoint)
      }) 
    }

    function stopDrag(event) {
      window.removeEventListener('mousemove', dragToTranslate, false)
      window.removeEventListener('mouseup', stopDrag, false)      
    }
  }

  actions.rotate = function rotate(event) {
    
  }

  actions.scale = function scale(event) {
    
  }

  // ADD NEW ACTIONS //

  actions.addAction = function(name, action) {
    if (typeof name === "string" && typeof action === "function") {
      this[name] = action
    }
  }

  actions.addEventListener = function(name, action, priority) {
    if (typeof name === "string" && typeof action === "function") {
      var listeners = events[name] || (events[name] = [])
      if (listeners.indexOf(action) < 0) {
        listeners.push(action)
        if (priority) {
          action.priority = priority

          listeners.sort(byPriority)
        }
      }
    }

    function byPriority(a, b) {
      if (a.priority !== undefined) {
        if (b.priority !== undefined) {
          return a.priority - b.priority
        } else {
          return -1
        }
      } else if (b.priority !== undefined) {
        return 1
      } else {
        return 0
      }
    }
  }

  // HELPER FUNCTIONS //

  function setCamera() {
    camera = context.camera
    viewWidth = camera.viewport.width
    viewHeight = camera.viewport.height

    cameraPosition.setFromMatrixPosition( camera.matrixWorld )
  
    viewToWorldMatrix.multiplyMatrices(camera.matrixWorld, viewToWorldMatrix.getInverse(camera.projectionMatrix))
  }

  function setBasis() {
    switch (context.basis) {
      case "view":
        basisMatrix.copy(camera.matrixWorld)
      break
      case "local":
        basisMatrix.copy(target.matrixWorld)
      break
      case "world":
        basisMatrix.identity()
      break
    }

    basisMatrix.extractBasis(xAxis, yAxis, zAxis)
  }

  function setMouseRay(event) {
    nearPoint.x = (event.clientX / viewWidth) * 2 - 1
    nearPoint.y = 1 - (event.clientY / viewHeight) * 2
    nearPoint.z = -1

    farPoint.copy(nearPoint).z = 1
    nearPoint.applyProjection(viewToWorldMatrix)
    farPoint.applyProjection(viewToWorldMatrix)
    
    mouseRay.origin.copy(nearPoint)
    mouseRay.direction.subVectors(farPoint, nearPoint)
  }

  function createAxisPlane(translationAxis) {
    moveRay.direction.copy(translationAxis).normalize()
    moveRay.origin.copy(axisPoint)
    
    axisPoint.copy(cameraPosition).mapToRayLine(moveRay)
    plane.normal.subVectors(cameraPosition, axisPoint)

    //// TREAT SPECIAL CASE:
    //// ** axisPoint identical to cameraPosition **
    //// This is acceptable for an orthogonal camera unless
    //// the translation axis is parallel to the camera 
    //// direction, but it is always meaningless for a
    //// perspective camera
    if (plane.normal.length() < Number.EPSILON) {
      // TODO: Check for orthogonal camera
      return stopDrag()
    }
    
    plane.normal.normalize()
    plane.constant = -axisPoint.dot(plane.normal)
  }

  function createConstraintPlane(normal) {
    plane.normal.copy(normal).normalize()
    plane.constant = -axisPoint.dot(plane.normal)
  }
})(window)


// Patch for THREE
THREE.Vector3.prototype.mapToRayLine = function ( ray ) {
  this.sub( ray.origin )
  var directionDistance = this.dot( ray.direction );
  this.copy( ray.direction ).multiplyScalar( directionDistance )
       .add( ray.origin )
}
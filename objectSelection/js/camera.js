"use strict"

;(function cameraController(window){
  var context = window.context || (window.context = {})

  context.addCameraController = function (viewport, circle) {
    var context = window.context
    var scene = context.scene
    var camera = context.camera
    var cameras = context.cameras

    var controlCamera

    // For mouse interactions
    var clientPoint = {}
    var centreX = circle.x
    var centreY = circle.y
    var radius = circle.radius
    var radius2 = radius * radius
    var rotationMatrix = new THREE.Matrix4()
    var pivotMatrix = new THREE.Matrix4()
    var startMatrix = new THREE.Matrix4()
    var start = new THREE.Vector3()
    var end = new THREE.Vector3() 
    var angle

    ;(function createControlCameraCubeAndCircle(){
      var side = 0.1
      var radius = Math.sqrt(side/2 * side/2 * 3)

      ;(function createCamera(){
        controlCamera = new THREE.OrthographicCamera(
         -radius, radius
        , radius, -radius
        , -radius, radius
        );
        controlCamera.viewport = viewport
        controlCamera.rotation.copy(camera.rotation)

        // Wait for the scene to be fully initialized before copying
        // the rotation of the main camera
        setTimeout(function () {
          controlCamera.rotation.copy(camera.rotation)
          controlCamera.updateMatrixWorld()
          controlCamera.matrixAutoUpdate = false
        }, 1)

        scene.add(controlCamera)
        cameras.push( controlCamera )
      })()

      ;(function createCompanionCube(){
        var cube = new THREE.Object3D()
        var cubeGeometry = new THREE.BoxGeometry( side, side, side )

        var faceMaterial = new THREE.MeshPhongMaterial({
          color: 0x006699
        , emissive: 0x999900
        , shading: THREE.FlatShading
        , transparent: true
        , opacity: 0.5
        })

        var box = new THREE.Mesh(
          cubeGeometry
        , faceMaterial
        )

        cube.add(new THREE.BoxHelper(box))
        cube.add(box)
        cube.add(new THREE.AxisHelper(radius))
        
        scene.add(cube);
      })()

      ;(function createCircle(){
        var circleGeometry = new THREE.CircleGeometry( radius, 36 );
        var material = new THREE.MeshBasicMaterial( {
          color: 0xffffcc
        } );
        var circle = new THREE.Mesh( circleGeometry, material );
        controlCamera.add( circle );
        circle.translateZ(-radius)
      })()
    })()

    context.mouseActions.addEventListener("mousedown", startDrag, 1)

    function startDrag(event) {
      event.preventDefault()

      context.setClientPoint(event, clientPoint)
      var x = clientPoint.x - centreX
      var y = centreY - clientPoint.y

      var delta2 = x * x + y * y
      if (delta2 > radius2) {
        // Not over the controller circle: ignore this priority action
        return false
      }

      var z = Math.sqrt(radius2 - delta2)
      start.set(x, y, z)
      
      context.addListener(window, "move", drag)
      context.addListener(window, "stop", stopDrag)

      // Prevent any other mousedown events from triggering
      return true

      function drag(event) {     
        var delta
        context.setClientPoint(event, clientPoint)
        x = clientPoint.x - centreX
        y = centreY - clientPoint.y
        delta2 = x * x + y * y

        if (delta2 > radius2) {
          // constrain to edge of sphere
          delta = Math.sqrt(delta2)
          x = x / delta * radius
          y = y / delta * radius
          z = 0
        } else {
          z = Math.sqrt(radius2 - delta2)
        }

        end.set(x, y, z)
        angle = start.angleTo(end)
        start.cross(end).normalize()

        rotationMatrix.makeRotationAxis(start, -angle)
        controlCamera.matrix.multiply(rotationMatrix)
        controlCamera.matrixWorldNeedsUpdate = true
        
        rotationMatrix.extractRotation(camera.matrixWorld)
        start.applyMatrix4(rotationMatrix).normalize()
        rotationMatrix.makeRotationAxis(start, -angle)
        camera.applyMatrix(rotationMatrix)
        camera.matrixWorldNeedsUpdate = true

        start.copy(end)
      }

      function stopDrag(event) {
        context.removeListener(window, "move", drag)
        context.removeListener(window, "stop", stopDrag)      
      }
    }
  }
})(window)
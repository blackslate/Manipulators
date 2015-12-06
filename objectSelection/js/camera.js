addCameraController = function (viewport, circle) {
  var context = window.context
  var scene = context.scene
  var camera = context.camera
  var cameras = context.cameras

  var controlCamera

  // For mouse interactions
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

      // If matrixAutoUpdate is set immediately, the camera rotation 
      // is not applied
      setTimeout(function () {
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

  // window.addEventListener("mousedown", startDrag, false)
  context.mouseActions.addEventListener("mousedown", startDrag, 1)

  function startDrag(event) {
    controlCamera.matrixAutoUpdate = false

    var x = event.clientX - centreX
    var y = centreY - event.clientY
    var delta2 = x * x + y * y
    if (delta2 > radius2) {
      // Not over the controller circle: ignore this priority action
      return false
    }

    var z = Math.sqrt(radius2 - delta2)
    start.set(x, y, z)
    
    window.addEventListener("mousemove", drag, false)
    window.addEventListener("mouseup", stopDrag, false)

    // Prevent any other mousedown events from triggering
    return true

    function drag(event) {     
      var delta
      x = event.clientX - centreX
      y = centreY - event.clientY
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
      if (angle > 0) {
        a = 0
      }
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
      window.removeEventListener("mousemove", drag, false)
      window.removeEventListener("mouseup", stopDrag, false)      
    }
  }
}
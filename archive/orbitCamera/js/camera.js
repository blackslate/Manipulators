

addCameraController = function (scene, camera, cameras, settings) {
  var controlCamera
  var viewport = settings.viewport

  // For mouse interactions
  var centreX = settings.circle.x
  var centreY = settings.circle.y
  var radius = settings.circle.radius
  var radius2 = radius * radius
  var rotationMatrix = new THREE.Matrix4()
  var pivotMatrix = new THREE.Matrix4()
  var startMatrix = new THREE.Matrix4()
  var start = new THREE.Vector3()
  var end = new THREE.Vector3() 
  var angle

  camera.matrixAutoUpdate = false /** takes control of main camera **/

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

      // If matrixAutoUpdate is set immediately, the camera rotation is
      // not applied
      setTimeout(function () {
        controlCamera.matrixAutoUpdate = false
      }, 1)

      scene.add(controlCamera)
      cameras.push( controlCamera )
    })()

    ;(function createCompanionCube(){
      var cube = new THREE.Object3D()
      var cubeGeometry = new THREE.BoxGeometry( side, side, side )

      var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff
      , transparent: true
      , opacity: 0.5
      })

      var faceMaterial = new THREE.MeshPhongMaterial({
        color: 0x006699
      , emissive: 0x006699
      , shading: THREE.FlatShading
      , transparent: true
      , opacity: 0.2
      })

      cube.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry( cubeGeometry )
        , lineMaterial
        )
      )
      cube.add(
        new THREE.Mesh(
          cubeGeometry
        , faceMaterial
        )
      )

      cube.add(new THREE.AxisHelper(radius))
      scene.add(cube);
    })()

    ;(function createCircle(){
      var circleGeometry = new THREE.CircleGeometry( radius, 36 );
      var material = new THREE.MeshBasicMaterial( {
        color: 0xccccff
      } );
      var circle = new THREE.Mesh( circleGeometry, material );
      controlCamera.add( circle );
      circle.translateZ(-radius)
    })()
  })()

  window.addEventListener("mousedown", startDrag, false)

  function startDrag(event) {
    controlCamera.matrixAutoUpdate = false
    // startMatrix.copy(camera.matrix)
    // // pivotMatrix.extractRotation(camera.matrix)
    // pivotMatrix.identity()

    var x = event.clientX - centreX
    var y = centreY - event.clientY
    var delta2 = x * x + y * y
    if (delta2 > radius2) {
      return
    }

    var z = Math.sqrt(radius2 - delta2)
    start.set(x, y, z)
    
    window.addEventListener("mousemove", drag, false)
    window.addEventListener("mouseup", stopDrag, false)

    function drag(event) {     
      var delta
      x = event.clientX - centreX
      y = centreY - event.clientY
      delta2 = x * x + y * y

      if (delta2 > radius2) {
        // constrain to adge of sphere
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
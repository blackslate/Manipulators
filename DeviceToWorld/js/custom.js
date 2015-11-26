function init() {
  var scene = new THREE.Scene()

  // Create a perspective camera
  var viewAngle = 45
  var width = window.innerWidth
  var height = window.innerHeight
  var ratio = width / height
  var near = 0.1
  var far = 3000
  var camera = new THREE.PerspectiveCamera(viewAngle,ratio,near,far)

  // create a render and set the size
  var renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(new THREE.Color(0xEEEEEE))
  renderer.setSize(width, height)

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(1000, 1000)
  var yellowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00
  , opacity: 0.25
  , transparent: true
  })
  var cyanMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff
  , opacity: 0.5
  , transparent: true
  })
  var magentaMaterial = new THREE.MeshBasicMaterial({
    color: 0xff00ff
  , opacity: 0.5
  , transparent: true
  })
  var xyPlane = new THREE.Mesh(planeGeometry, yellowMaterial)
  scene.add(xyPlane)

  var yzPlane = new THREE.Mesh(planeGeometry, cyanMaterial)
  yzPlane.rotation.y = 0.5 * Math.PI
  scene.add(yzPlane)

  var xzPlane = new THREE.Mesh(planeGeometry, magentaMaterial)
  xzPlane.rotation.x = -0.5 * Math.PI
  scene.add(xzPlane)

  // position and point the camera to the center of the scene
  camera.position.x = 500
  camera.position.y = 700
  camera.position.z = 1300
  camera.lookAt(scene.position)

  // add the output of the renderer to the html element
  document.getElementById("WebGL-output").appendChild(renderer.domElement)

  ;(function createObjectManipulator(scene, camera){
    var viewPlane
    // <FOR TESTING>
    var cubeGeometry = new THREE.BoxGeometry(40, 40, 40)
    var cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    , wireframe: true})
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    // </FOR TESTING>

    ;(function createViewPortPlane() {
      // Add the camera to the scene so that its children are
      // in the scene
      scene.add(camera)

      // Create an invisible plane that will fill the view of 
      // the perspective camera. For an orthographic camera,
      //  the plane will have different scaling.
      var side = 2000
      var segments = 20
      var planeGeometry = new THREE.PlaneBufferGeometry(side, side, segments, segments)
      var planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000
      , wireframe: false
      , transparent: true
      , opacity: 0.5})
      viewPlane = new THREE.Mesh(planeGeometry, planeMaterial)

      //viewPlane.visible = false
      
      // viewAngle is vertical angle of camera frustrum. Use
      // half the angle to place the plane at the point where
      // it fills the viewport. If the plane fills viewport
      // perfectly, the viewport point (1,1) is outside the plane, so
      // raycaster intersects return nothing. Solution: fudge.
      var fudge = 0.9 //999
      var angle = camera.fov * Math.PI / 360
      var distance = side / 2 / Math.tan(angle)
      viewPlane.translateZ(-distance * fudge)
      viewPlane.scale.x = camera.aspect
      camera.add(viewPlane)
    })()

    window.addEventListener( 'mousedown', startDrag, false )

    function startDrag(event) {
      window.addEventListener( 'mousemove', drag, false )
      window.addEventListener( 'mouseup', stopDrag, false )
    
      var mouse3 = new THREE.Vector3()
      var clickPoint3 = new THREE.Vector3()
      var cameraPosition = (function getCameraWorldPosition() {
        var position = new THREE.Vector3()
        camera.updateMatrixWorld()
        position.setFromMatrixPosition( camera.matrixWorld )
        return position
      })()
      var cameraToWorld = new THREE.Matrix4()

      ;(function initializeDrag(){
        var viewX = event.clientX / window.innerWidth
        var viewY = 1 - event.clientY / window.innerHeight
        clickPoint3.x = viewX
        clickPoint3.y = viewY

        ;(function createDragMatrix(){
          var mouse2 = new THREE.Vector2()
          var raycaster = new THREE.Raycaster()
          var ray = new THREE.Vector3()
          var originToClickPoint = new THREE.Vector3()
          var temp = new THREE.Vector3()
          var xAxis = new THREE.Vector3()
          var yAxis = new THREE.Vector3()
          var zAxis = camera.getWorldDirection().negate()
          var aspect = camera.aspect

          var targetDistance = -1
          var planeDistance
            , clickPointWorld
            , ratio
            , origin
            , angle

          mouse2.x = viewX * 2 - 1
          mouse2.y = viewY * 2 - 1
          raycaster.setFromCamera( mouse2, camera )
          intersects = raycaster.intersectObjects(scene.children,true)

          if (intersects.length < 2) {
            stopDrag()
            return
          }
          
          intersects.forEach(function setDistances(data, index) {
            if (data.object === viewPlane) {
              planeDistance = data.distance
            } else if (targetDistance < 0) {
              targetDistance = data.distance
              clickPointWorld = data.point
            }
          })

          ratio = targetDistance / planeDistance

          //console.log(targetDistance, planeDistance, ratio)
          mouse2.x = mouse2.y = -1
          raycaster.setFromCamera( mouse2, camera )
          intersects = raycaster.intersectObject ( viewPlane )
          origin = intersects[0].point
          ray.subVectors(origin, cameraPosition).multiplyScalar(ratio)
          origin = ray.add(cameraPosition)
          
          // EDGE CASES: click on left or bottom edge, angle 0° or 90°
          angle = Math.atan2(viewY, viewX * aspect)
          originToClickPoint.subVectors(clickPointWorld, origin)
          temp.copy(originToClickPoint)
          temp.applyAxisAngle(zAxis, -angle)
          xAxis.copy(originToClickPoint)
               .projectOnVector(temp)
               .multiplyScalar(1 / viewX)

          temp.copy(originToClickPoint)
          temp.applyAxisAngle(zAxis, (Math.PI/2 - angle))
          yAxis.copy(originToClickPoint).projectOnVector(temp)
          yAxis.multiplyScalar(1 / viewY)
          console.log(xAxis, yAxis, zAxis)

          cameraToWorld.makeBasis(xAxis, yAxis, zAxis)
          cameraToWorld.setPosition(origin)

          // <FOR TESTING>
          cube.position.copy(clickPointWorld)
          scene.add(cube)
          var distanceToCube = clickPointWorld.clone().sub(cameraPosition).dot(zAxis)
          viewPlane.position.z = distanceToCube
          // </FOR TESTING>

        })()
      })()

      function drag(event) {
        var cubePosition
        var dragPoint3 = new THREE.Vector3()
        var viewX = event.clientX / window.innerWidth
        var viewY = 1 - event.clientY / window.innerHeight
        dragPoint3.x = viewX
        dragPoint3.y = viewY

        cubePosition = dragPoint3.clone().applyMatrix4(cameraToWorld)

        cube.position.copy(cubePosition)
      }

      function stopDrag(event) {
        window.removeEventListener( 'mousemove', drag, false )
        window.removeEventListener( 'mouseup', stopDrag, false )      
      }
    }

  })(scene, camera)

  ;(function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  })()
}

window.onload = init
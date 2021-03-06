function init() {
  var PLANE = new THREE.Plane(new THREE.Vector3(0,1,0), 0)

  //<HARD-CODED for testing>
  var selection = [] // will contain three objects
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
  var planeGeometry = new THREE.PlaneGeometry(60, 20)
  var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc})
  var plane = new THREE.Mesh(planeGeometry, planeMaterial)

  plane.rotation.x = -0.5 * Math.PI
  plane.position.x = 15
  plane.position.y = 0
  plane.position.z = 0
  scene.add(plane)

  // create a cube with a custom rotation
  var cubeGeometry = new THREE.BoxGeometry(4, 4, 4)
  var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

  cube.rotateOnAxis(new THREE.Vector3(0,0,1), Math.PI/4)
  cube.position.x = -4
  cube.position.y = 2
  cube.position.z = 0
  cube.scale.x = 2

  plane.add(cube)

  // create a sphere
  var sphereGeometry = new THREE.SphereGeometry(4, 20, 20)
  var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true})
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

  sphere.position.x = 20
  sphere.position.y = 0
  sphere.position.z = 4

  plane.add(sphere)

  // add a second sphere as a child of the first
  var sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere2.position.y = 5
  sphere2.scale.x = 0.5
  sphere2.scale.y = 0.5
  sphere2.scale.z = 0.5
  sphere.add(sphere2)

  selection.push(sphere, sphere2, cube)

  // position and point the camera to the center of the scene
  camera.position.x = -30
  camera.position.y = 40
  camera.position.z = 30
  camera.lookAt(scene.position)
  camera.lookAt(scene.position)

  // add the output of the renderer to the html element
  document.getElementById("WebGL-output").appendChild(renderer.domElement)

  ;(function createObjectManipulator(scene, camera){
    var plane

    function createViewPortPlane() {
      // Add the camera to the scene so that its children are
      // in the scene
      scene.add(camera)

      // Create an invisible plane that will fill the view of 
      // the perspective camera. For an orthographic camera,
      //  the plane will have different scaling.
      var side = 2000
      var segments = 20
      var planeGeometry = new THREE.PlaneBufferGeometry(side, side, segments, segments)
      var planeMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true})
      plane = new THREE.Mesh(planeGeometry, planeMaterial)

      plane.visible = false
      
      // viewAngle is vertical angle of camera frustrum. Use
      // half the angle to place the plane at the point where
      // it fills the viewport
      var angle = camera.fov * Math.PI / 360
      var distance = side / 2 / Math.tan(angle)
      camera.add(plane)
      plane.translateZ(-distance)
      plane.scale.x = camera.aspect
    }

    function startTranslation( event ) {
      var normal = PLANE.normal
      var raycaster = new THREE.Raycaster()
      var mouse = new THREE.Vector2()
      var mappedAxis = new THREE.Vector3()
      var orthoVector = new THREE.Vector3()
      var cameraPosition = getCameraWorldPosition()
      var planeNormal = camera.getWorldDirection()

      var clickDistance = -1 // from camera to click point on object
      var dragSelection = [] // contains no children
      var intersects // array of intersection objects
        , pointOnPlane // click point on camera plane
        , startDirection // direction of click ray
        , startAngle // angle between click ray and AXIS

      selection.forEach(function (object) {
        var parent = object
        while (parent = parent.parent) {
          if (selection.indexOf(parent) > -1) {
            return
          }
        }

        var position = new THREE.Vector3()
        position.setFromMatrixPosition(object.matrixWorld)
        var data = {
          object: object
        , position: position
        }

        dragSelection.push(data)
      })

      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1

      raycaster.setFromCamera( mouse, camera )
      selection.push(plane)
      intersects = raycaster.intersectObjects ( selection )
      selection.pop()
      if (intersects.length < 2) {
        // The user did not click on one of the selected objects
        // so we ignore the drag. In the future, we might use the
        // centre of gravity of the selection instead.
        return
      }

      startDirection = raycaster.ray.direction.clone().normalize()
      startAngle = Math.PI - Math.acos(AXIS.dot(startDirection))

      setMappedAxis(AXIS, planeNormal)
      setIntersectionPoints(intersects, startDirection)

      function getCameraWorldPosition() {
        var position = new THREE.Vector3()
        camera.updateMatrixWorld()
        position.setFromMatrixPosition( camera.matrixWorld )
        return position
      }

      function setMappedAxis(axis, normal) {
        orthoVector.crossVectors(normal, axis)
        orthoVector.normalize()
        mappedAxis.crossVectors(orthoVector, normal)
        mappedAxis.normalize()
      }

      function setIntersectionPoints(intersects) {
        intersects.forEach(function (intersectionObject) {
          if ( intersectionObject.object === plane ) {
            pointOnPlane = intersectionObject.point
          } else if (clickDistance < 0) {
            clickDistance = intersectionObject.distance
          }
        })
      }

      function moveSelectionInPlane( mouse ) {
        var dragVector = new THREE.Vector3()
        var dragPoint = new THREE.Vector3()
        var dragDirection = new THREE.Vector3()

        raycaster.setFromCamera( mouse, camera )
        intersects = raycaster.intersectObject ( plane )
        var secondPoint = intersects[0].point

        // Project secondPoint onto the mappedAxis
        dragVector.subVectors(secondPoint, pointOnPlane)
        dragVector.projectOnVector(mappedAxis)
        dragPoint.addVectors(pointOnPlane, dragVector)
        // Get ray pointing from camera to projected point
        dragDirection.subVectors(dragPoint, cameraPosition)
        dragDirection.normalize()

        // Use sine rule to determine distance along AXIS
        var dragAngle = Math.acos(startDirection.dot(dragDirection))
        if (isNaN(dragAngle)) {
          // When the angle between normalized vectors is very
          // small, the dot product may be greater than 1.
          // https://github.com/mrdoob/three.js/issues/7677
          dragAngle = 0
        }

        // Check if movement is in the -ve direction of the axis
        dragDirection.cross(startDirection).normalize()
        var invert = dragDirection.dot(orthoVector) > 0
        var farSine = Math.sin(Math.PI - dragAngle - startAngle)
        if (invert) {
          farSine = -Math.sin(startAngle - dragAngle)
        }         
        var dragSine = Math.sin(dragAngle)          
        var translation = clickDistance * dragSine / farSine     

        // Update the world position of each selected object
        dragSelection.forEach(function (objectData) {
          var object = objectData.object
          var position = objectData.position.clone() // world
          var vector = AXIS.clone().multiplyScalar(translation)
         
          position.add(vector) // updated
          object.parent.worldToLocal(position)
          object.position.x = position.x
          object.position.y = position.y
          object.position.z = position.z
        })
      }

      window.addEventListener( 'mousemove', translate, false )
      window.addEventListener( 'mouseup', stopTranslation, false )

      function translate(event) {
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
        moveSelectionAlongAxis(mouse)
      }

      function stopTranslation() {
        window.removeEventListener( 'mousemove', translate )
        window.removeEventListener( 'mouseup', stopTranslation )
      }
    }

    window.addEventListener( 'mousedown', startTranslation, false )

    createViewPortPlane()
    render()

  })(scene, camera)

  function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
}

window.onload = init
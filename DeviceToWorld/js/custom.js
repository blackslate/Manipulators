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
    var constraint = ""

     // <FOR TESTING ONLY>
    var dragPlane
    var dragCube
    var cameraPosition
    var zAxis
    var constraintElement = document.querySelector("#constraint")

    ;(function treatConstraintKeys(){
      // Use Z, X and C (instead of Y) or ;QJ to toggle constraints 
      window.addEventListener( 'keydown', addConstraint, false )
      window.addEventListener( 'keyup', removeConstraint, false )
      var keys = {
        88: "x"
      , 67: "y" // c
      , 86: "y" // v
      , 89: "y"
      , 90: "z"
        // DVORAK
      , 81: "x" // q
      , 74: "y" // j
      , 75: "y" // k
      , 186: "z" // ;
      }
      var constraintKeysPressed = []

      function addConstraint(event) {
        var key = keys[event.keyCode]
        if (key && constraintKeysPressed.indexOf(key) < 0) {
          constraintKeysPressed.push(key)
          constraintKeysPressed.sort()
          constraint = constraintKeysPressed.join("")
        }
        constraintElement.innerHTML = constraint
      }

      function removeConstraint(event) {
        var key = keys[event.keyCode]
        var index = constraintKeysPressed.indexOf(key)
        if (index > -1) {
          constraintKeysPressed.splice(index, 1)
          constraint = constraintKeysPressed.join("")
        }
        constraintElement.innerHTML = constraint
      }
    })()

    ;(function testing() {     
      // CUBE TO DRAG
      var cubeGeometry = new THREE.BoxGeometry(40, 40, 40)
      var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
      , wireframe: true})
      dragCube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    })()
    // </FOR TESTING ONLY>

    var viewport = window
    var viewWidth = viewport.innerWidth
    var viewHeight = viewport.innerHeight

    ;(function cameraProjectDemo(){
      viewport.addEventListener( 'mousedown', startDrag, false )

      var target
        , worldClickPoint
        , viewClickPoint

      function startDrag(event) { 
        window.addEventListener( 'mousemove', drag, false )
        window.addEventListener( 'mouseup', stopDrag, false )
 
        var viewPoint = getViewPoint(event)
        target = getModelUnderMouse(viewPoint)

        if (!target) {
          stopDrag()
          return
        }

        worldClickPoint = target.point
        viewClickPoint = worldClickPoint.clone().project(camera)

        ;(function testing(){ 
          dragCube.position.copy(target.point)
          scene.add(dragCube)
        })()
      }

      function drag(event) {
        var viewPoint = getViewPoint(event, viewClickPoint.z)
        var worldPoint = viewPoint.clone().unproject(camera)
        var translateVector = worldPoint.clone().sub(worldClickPoint)

        //console.log(translateVector, translateVector.length())

        switch (constraint) {
          default: // case "xyz":
            // No constraint: drag along plane parallel to viewport
            return dragCube.position.copy(worldPoint)

          case "x":
            translateVector.y = translateVector.z = 0
          break
          case "y":
            translateVector.x = translateVector.z = 0
          break
          case "z":
            translateVector.x = translateVector.y = 0
          break
          case "yz":
            translateVector.x = 0
          break
          case "xz":
            translateVector.y = 0
          break
          case "xy":
            translateVector.z = 0
          break
        }

        if (translateVector.length() > 100) {
          a = 0
        }

        worldPoint.addVectors(worldClickPoint, translateVector)
        dragCube.position.copy(worldPoint)
      }

      function stopDrag(event) {
        window.removeEventListener( 'mousemove', drag, false )
        window.removeEventListener( 'mouseup', stopDrag, false )      
      }

      function getViewPoint(event, z) {
        var viewPoint = new THREE.Vector3()

        viewPoint.x = (event.clientX / viewWidth) * 2 - 1
        viewPoint.y = 1 - (event.clientY / viewHeight) * 2
        viewPoint.z = z || 0
 
        return viewPoint
      }

      function getModelUnderMouse(viewPoint) {
        var raycaster = new THREE.Raycaster()    

        raycaster.setFromCamera( viewPoint, camera )
        intersects = raycaster.intersectObjects(scene.children)
        
        return intersects[0] // may be undefined
      }
    })()
  })(scene, camera)

  ;(function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  })()
}

THREE.Ray.prototype.closestPointToRay = function (that, details) {
  // that: THREE.Ray() 
  // details: (optional) object
  // { pointOnThisRay: <THREE.Vector3>
  // , pointOnThatRay: <THREE.Vector3>
  // , midPoint: <THREE.Vector3>
  // , distanceBetweenClosestPoints: <float>
  // }
  // For an explanation of the vector mathematics, see: 
  // http://morroworks.com/Content/Docs/Rays%20closest%20point.pdf
  
  // @return undefined if rays are invalid or parallel
  //         or THREE.Vector3() point on this ray which is closest
  //         to that ray.
  
  if (!(that instanceof THREE.Ray)) {
    return
  }
  
  var thisDirection = this.direction
  var thatDirection = that.direction

  if (!thisDirection.clone().cross(thatDirection).length()) {
    // Rays are parallel
    return 
  }

  if ( !thisDirection.dot(thisDirection)
    || !thatDirection.dot(thatDirection)) {
    // At least one of the rays is just a point with no direction
    return
  }

  var closestPoint = new THREE.Vector3()
  var thisOrigin = this.origin
  var thatOrigin = that.origin
  var sameOrigin = thisOrigin.equals(thatOrigin)

  if (sameOrigin) {
    // Simple case
    closestPoint.copy(thisOrigin)
  } else {
    var a = thisDirection.clone().normalize()
    var b = thatDirection.clone().normalize()
    var c = thatOrigin.clone().sub(thisOrigin)

    var p = a.dot(b)
    var q = a.dot(c)
    var r = b.dot(c)
    var s = a.dot(a) // already known to be non-zero
    var t = b.dot(b) // already known to be non-zero

    var divisor = (s * t - p * p)

    if (!divisor) {
      // The two rays are colinear. They are "closest" at all points
      // This case should already have been excluded by the .cross()
      // check made at the start.
      return
    }

    var d = (q * t - p * r) / divisor
    closestPoint.copy(thisOrigin).add(a.multiplyScalar(d))
  }

  if ( typeof details === "object" ) {
    details.pointOnThisRay = closestPoint
    
    if (sameOrigin) {
      // Should all points be the same object or clones?
      details.pointOnThatRay = closestPoint
      details.midPoint = closestPoint
      details.distanceBetweenClosestPoints = 0
    } else {
      // TODO: Add other details
      d = (p * q - r * s) / divisor
      var thatPoint = new THREE.Vector3().copy(thatOrigin).add(b.multiplyScalar(d))
      details.pointOnThatRay = thatPoint
      details.midPoint = closestPoint.clone()
                                     .add(thatPoint)
                                     .divideScalar(2)
      details.distanceBetweenClosestPoints = closestPoint.distanceTo(thatPoint)
    }
  }

  return closestPoint
}

window.onload = init
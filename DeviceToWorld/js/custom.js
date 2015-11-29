/**
This version uses a THREE.Raycaster to get the object under the mouse
when the user first clicks. Later versions should use ...

$scene.clara('registerTool', {
  name: "treatClick"
, click: <nameOfFunction>
})

...  and get the details of the object that was clicked from the
event that is passed to the function.

Modifications are currently applied directly to the transform matrix
of the manipulated object. Later versions will:
* modify a separate matrix in world space for the manipulation
* create a local-space matrix for each manipulated object
* use ctx() to update the local matrix of each object reactively
**/


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
    var freedom = "" //"x" | "y" | "z" | "yz" | "xy" | "xz" | "xyz"
    var space = "world" // "local" | "view"
    var action = "translate"

     // <FOR TESTING ONLY>
    var dragPlane
    var dragCube
    var zAxis
    var freedomElement = document.querySelector("#freedom")
    document.querySelector("#space").onchange = function (event) {
      space = event.target.value
    }
    document.querySelector("#action").onchange = function (event) {
      action = event.target.value
    }

    ;(function treatContext(){
      // Use Z, X and C (instead of Y) or ;QJ to toggle freedoms 
      window.addEventListener( 'keydown', addFreedom, false )
      window.addEventListener( 'keyup', removeFreedom, false )
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
      var freedomKeysPressed = []

      function addFreedom(event) {
        var key = keys[event.keyCode]
        if (key && freedomKeysPressed.indexOf(key) < 0) {
          freedomKeysPressed.push(key)
          freedomKeysPressed.sort()
          freedom = freedomKeysPressed.join("")
        }
        freedomElement.innerHTML = freedom
      }

      function removeFreedom(event) {
        var key = keys[event.keyCode]
        var index = freedomKeysPressed.indexOf(key)
        if (index > -1) {
          freedomKeysPressed.splice(index, 1)
          freedom = freedomKeysPressed.join("")
        }
        freedomElement.innerHTML = freedom || "xyz"
      }
    })()

    ;(function testing() {     
      // CUBE TO DRAG
      var cubeGeometry = new THREE.BoxGeometry(40, 40, 40)
      var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000
      , wireframe: true})
      dragCube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      dragCube.rotation.x = 30
      dragCube.rotation.y = 45
    })()
    // </FOR TESTING ONLY>

    var viewport = window
    var viewWidth = viewport.innerWidth
    var viewHeight = viewport.innerHeight

    ;(function cameraProjectDemo(){
      viewport.addEventListener( 'mousedown', startDrag, false )

      var targetData
        , worldClickPoint
        , viewClickPoint
        , cameraPosition // set on startDrag

      function startDrag(event) { 
        window.addEventListener( 'mousemove', drag, false )
        window.addEventListener( 'mouseup', stopDrag, false )
 
        cameraPosition = camera.getWorldPosition()
        var viewPoint = getViewPoint(event)
        targetData = getModelUnderMouse(viewPoint) // uses Raycaster

        if (!targetData) {
          stopDrag()
          return
        }

        worldClickPoint = targetData.point
        viewClickPoint = worldClickPoint.clone().project(camera)

        ;(function testing(){ 
          dragCube.position.copy(targetData.point)
          scene.add(dragCube)
        })()
      }

      function drag(event) {
        switch (action) {
          // IGNORE action FOR NOW. JUST TRANSLATE.
          case "rotate":
          case "scale":
          case "translate":
            dragToTranslate(event)
          break
        }
      }

      function dragToTranslate (event) {
        var matrix = new THREE.Matrix4() // world space
        var xAxis = new THREE.Vector3()
        var yAxis = new THREE.Vector3()
        var zAxis = new THREE.Vector3()

        switch (space) {
          case "view":
            matrix.copy(camera.matrixWorld)
          break
          case "local":
            matrix.copy(dragCube.matrixWorld)
          break
          case "world":
            // matrix is already in world space
          break
        }

        matrix.extractBasis(xAxis,yAxis,zAxis)

        switch (freedom) {
          default: // case "xyz":
            // No constraint: drag along plane parallel to viewport
            constrainToViewPlane(event)
          break

          case "x":
            constrainToAxis(xAxis, event)
          break
          case "y":
            constrainToAxis(yAxis, event)
          break
          case "z":
           constrainToAxis(zAxis, event)
          break

          case "yz":
            constrainToPlane("x", xAxis, event)
          break
          case "xz":
            constrainToPlane("y", yAxis, event)
          break
          case "xy":
            constrainToPlane("z", zAxis, event)
          break
        }

        function constrainToAxis(axis, event) {
          var axisRay = new THREE.Ray(
            dragCube.getWorldPosition()
          , axis
          )
          var viewRay = getCameraRay(event)
          var axisPosition = axisRay.closestPointToRay(viewRay)
          if (axisPosition) {
            dragCube.position.copy(axisPosition)
          }
        }

        function constrainToPlane(constrain, normal, event) {
          
        }

        function constrainToViewPlane(event) {
          var worldPoint = getWorldViewPoint(event, viewClickPoint.z)
          dragCube.position.copy(worldPoint)
        }
      }

      function stopDrag(event) {
        window.removeEventListener( 'mousemove', drag, false )
        window.removeEventListener( 'mouseup', stopDrag, false )      
      }

      function getViewPoint(event, z) {
        var viewPoint = new THREE.Vector3()

        viewPoint.x = (event.clientX / viewWidth) * 2 - 1
        viewPoint.y = 1 - (event.clientY / viewHeight) * 2
        if (z) {
          viewPoint.z = z
        }
 
        return viewPoint
      }

      function getWorldViewPoint(event, z) {
        var viewPoint = getViewPoint(event, z)
        viewPoint.unproject(camera)
        return viewPoint
      }

      function getCameraRay(event) {
        var worldPoint = getWorldViewPoint(event)
        var direction = worldPoint.sub(cameraPosition).normalize()
        var ray = new THREE.Ray(cameraPosition, direction)
        return ray
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


// Extending Three.js //

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

THREE.Object3D.prototype.getWorldPosition = function (forceUpdate) {
  var position = new THREE.Vector3()

  if (forceUpdate) {
    this.updateMatrixWorld()
  }

  position.setFromMatrixPosition( this.matrixWorld )

  return position
}

window.onload = init
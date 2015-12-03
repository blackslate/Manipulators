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

  // <FOR TESTING ONLY>
  var freedom = "z" //"x" | "y" | "z" | "yz" | "xy" | "xz" | "xyz"
  var basis = "world" // "local" | "view"
  var action = "translate"

  var dragCube

  document.querySelector("#basis").onchange = function (event) {
    basis = event.target.value
  }
  document.querySelector("#action").onchange = function (event) {
    action = event.target.value
  }

  ;(function createWorldPlanes(){
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
  })()
 
  ;(function treatContext(){
    // Use Z, X and C (instead of Y) or ;QJ to toggle freedoms 
    window.addEventListener( 'keyup', toggleFreedom, false )

    var freedomElement = document.querySelector("#freedom")
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

    function toggleFreedom(event) {
      var key = keys[event.keyCode]

      if (key) {
        var index = freedomKeysPressed.indexOf(key)

        if (index < 0) {
          freedomKeysPressed.push(key)
          freedomKeysPressed.sort()
          freedom = freedomKeysPressed.join("")
        } else {
          freedomKeysPressed.splice(index, 1)
          freedom = freedomKeysPressed.join("")
        }

        freedomElement.innerHTML = freedom || "xyz"
      }
    }
  })()

  ;(function testing() {     
    // CUBE TO DRAG
    var cubeGeometry = new THREE.BoxGeometry(40, 40, 40)
    var cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000
    , wireframe: true})
    dragCube = new THREE.Mesh(cubeGeometry, cubeMaterial)
    dragAxes = new THREE.AxisHelper(100)
    dragCube.add(dragAxes)
    dragCube.rotation.x = 30
    dragCube.rotation.y = 45
    scene.add(dragCube)
  })()
  // </FOR TESTING ONLY>

  // Create a perspective camera
  var FOV = 45
  var WIDTH = window.innerWidth
  var HEIGHT = window.innerHeight
  var ASPECT = WIDTH / HEIGHT
  var NEAR = 0.1
  var FAR = 3000
  var camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR)

  // position and point the camera to the center of the scene
  camera.position.x = 500
  camera.position.y = 700
  camera.position.z = 1300
  camera.lookAt(scene.position)

  // create a render and set the size
  var renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(new THREE.Color(0xEEEEEE))
  renderer.setSize(WIDTH, HEIGHT)


  // add the output of the renderer to the html element
  document.getElementById("WebGL-output").appendChild(renderer.domElement)

  ;(function createObjectManipulator(scene, camera){
    window.addEventListener( 'mousedown', startDrag, false )

    var cameraPosition = new THREE.Vector3()
    var axisPoint = new THREE.Vector3()
    var nearPoint = new THREE.Vector3(0, 0, -1)
    var farPoint = new THREE.Vector3(0, 0, 1)
    var planePoint = new THREE.Vector3()
    var basisMatrix = new THREE.Matrix4() // world space
    var xAxis = new THREE.Vector3()
    var yAxis = new THREE.Vector3()
    var zAxis = new THREE.Vector3()
    var plane = new THREE.Plane()
    var moveRay = new THREE.Ray()
    var mouseRay = new THREE.Ray()
    var viewToWorldMatrix = new THREE.Matrix4()

    var targetData
      , targetObject

    function startDrag(event) { 
      window.addEventListener( 'mousemove', drag, false )
      window.addEventListener( 'mouseup', stopDrag, false )

      targetData = getModelUnderMouse(event) // uses Raycaster

      if (!targetData) {
        stopDrag()
        return
      }

      targetObject = targetData.object
      setBasis()

      
      viewToWorldMatrix.multiplyMatrices(camera.matrixWorld, viewToWorldMatrix.getInverse(camera.projectionMatrix))

      switch (action) {
        // IGNORE action FOR NOW. JUST TRANSLATE.
        case "rotate":
        case "scale":
        case "translate":
          initializeTranslation(event)
        break
      }

      function initializeTranslation() {
        axisPoint.setFromMatrixPosition(targetObject.matrixWorld)

        switch (freedom) {
          default: // case "xyz":
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

        function createAxisPlane(translationAxis) {
          moveRay.direction.copy(translationAxis)
          moveRay.origin.copy(axisPoint)

          cameraPosition.setFromMatrixPosition( camera.matrixWorld )
          
          moveRay.closestPointToPoint(cameraPosition, axisPoint)
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
      }
    }

    function setBasis() {
      switch (basis) {
        case "view":
          basisMatrix.copy(camera.matrixWorld)
        break
        case "local":
          basisMatrix.copy(targetObject.matrixWorld)
        break
        case "world":
          basisMatrix.identity()
        break
      }

      basisMatrix.extractBasis(xAxis,yAxis,zAxis)
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

    function dragToTranslate(event) {
      // setBasis()
      setMouseRay(event)
      mouseRay.intersectPlane(plane, planePoint)

      switch (freedom) {
        case "x":
        case "y":
        case "z":
          planePoint.mapToRayLine(moveRay)
        break
      }

      // TESTING 
      dragCube.position.copy(planePoint)    
    }

    function stopDrag(event) {
      window.removeEventListener( 'mousemove', drag, false )
      window.removeEventListener( 'mouseup', stopDrag, false )      
    }

    function setMouseRay(event) {
      getViewPoint(event, nearPoint)
      farPoint.copy(nearPoint).z = 1
      nearPoint.setZ(-1).applyProjection(viewToWorldMatrix)
      farPoint.applyProjection(viewToWorldMatrix)
      
      mouseRay.origin.copy(nearPoint)
      mouseRay.direction.subVectors(farPoint, nearPoint)
    }

    function getViewPoint(event, viewPoint) {
      viewPoint ? null : viewPoint = new THREE.Vector3()

      viewPoint.x = (event.clientX / WIDTH) * 2 - 1
      viewPoint.y = 1 - (event.clientY / HEIGHT) * 2
      // viewPoint.z = 0
       
      return viewPoint      
    }

    function getModelUnderMouse(event) {
      // TO BE REPLACED BY A registerTool click EVENT
      var viewPoint = getViewPoint(event)

      var raycaster = new THREE.Raycaster()    

      raycaster.setFromCamera( viewPoint, camera )
      intersects = raycaster.intersectObject(dragCube)
      
      return intersects[0] // may be undefined
    }
  
  })(scene, camera)

  ;(function render() {
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  })()
}

THREE.Vector3.prototype.mapToRayLine = function ( ray ) {
  this.sub( ray.origin )
  var directionDistance = this.dot( ray.direction );
  this.copy( ray.direction ).multiplyScalar( directionDistance )
       .add( ray.origin )
}

window.onload = init
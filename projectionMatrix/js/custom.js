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
var setCameraRay

function init() {
  var scene = new THREE.Scene()

  // Create a perspective camera
  var viewAngle = 45
  var width = window.innerWidth
  var height = window.innerHeight
  var ratio = width / height
  var near = 1
  var far = 3001
  var camera = new THREE.PerspectiveCamera(viewAngle,ratio,near,far)

  // create a render and set the size
  var renderer = new THREE.WebGLRenderer()
  renderer.setClearColor(new THREE.Color(0xEEEEEE))
  renderer.setSize(width, height)

  ;(function createXYZPlanes(){
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

  // position and point the camera to the center of the scene
  // camera.position.x = 500
  // camera.position.y = 750
  camera.position.z = 1501
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

    ;(function treatContext(){
      // Use Z, X and C (instead of Y) or ;QJ to toggle freedoms 
      window.addEventListener( 'keyup', toggleFreedom, false )
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

      var freedomElement = document.querySelector("#freedom")
      document.querySelector("#space").onchange = function (event) {
        space = event.target.value
      }
      document.querySelector("#action").onchange = function (event) {
        action = event.target.value
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

      // Static matrices for the camera projection
      var projectionMatrix = camera.projectionMatrix
      var unprojectMatrix = new THREE.Matrix4().getInverse(projectionMatrix)

      // Matrix and axes that will be reused each time the mouse is
      // moved
      var matrix = new THREE.Matrix4() // world space
      var xAxis = new THREE.Vector3()
      var yAxis = new THREE.Vector3()
      var zAxis = new THREE.Vector3()
      
      var parentMatrix = new THREE.Matrix4()
      var viewToWorldMatrix = new THREE.Matrix4()

      var nearViewPoint = new THREE.Vector3()
      var farViewPoint = new THREE.Vector3()
      var nearWorldPoint = new THREE.Vector3()
      var farWorldPoint = new THREE.Vector3()

      var mouseWorldVector = new THREE.Vector3()
      var dragPosition = new THREE.Vector3()
      var cameraRay = new THREE.Ray()
      var axisRay = new THREE.Ray()

      var targetData // set on startDrag




        var lastScalar = 0
        var lastZ = 0

      function startDrag(event) { 
        window.addEventListener( 'mousemove', drag, false )
        window.addEventListener( 'mouseup', stopDrag, false )
        setNearViewPoint(event)

        targetData = getModelUnderMouse(nearViewPoint) // uses Raycaster

        if (!targetData) {
          stopDrag()
          return
        }

        ;(function testing(){ 
          dragCube.position.copy(targetData.point)
          scene.add(dragCube)
        })()
    
        viewToWorldMatrix.multiplyMatrices(camera.matrixWorld, unprojectMatrix)

        parentMatrix.copy(dragCube.parent.matrixWorld)
        parentMatrix.getInverse(parentMatrix)
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
        switch (space) {
          case "view":
            matrix.copy(camera.matrixWorld)
          break
          case "local":
            matrix.copy(dragCube.matrixWorld)
          break
          case "world":
            matrix.identity() // world space
          break
        }

        matrix.extractBasis(xAxis,yAxis,zAxis)

        switch (freedom) {
          default: // case "xyz":
            // No constraint: drag along plane parallel to viewport
            //constrainToViewPlane(event)
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
          // Get world position of object to translate
          dragPosition.setFromMatrixPosition( dragCube.matrixWorld )
          axisRay.origin = dragPosition
          axisRay.direction = axis

          setCameraRay(event)
          var scalar = axisRay.closestPointToRay(cameraRay)
          if (scalar) {
            if (lastScalar && lastScalar * scalar < 0) {
              a = 0
            }
            lastScalar = scalar
            dragPosition.addScaledVector(axis, scalar) // world

            if (lastZ && dragPosition.z > lastZ) {
              a = 0
            }
            console.log("a", dragPosition, lastZ)
            lastZ = dragPosition.z
            console.log("b", dragPosition, lastZ)

            dragPosition.applyMatrix4(parentMatrix)
            dragCube.position.copy(dragPosition)
          }
        }

        function constrainToPlane(constrain, normal, event) {
          
        }

        function constrainToViewPlane(event) {
          
        }
      }

      function stopDrag(event) {
        window.removeEventListener( 'mousemove', drag, false )
        window.removeEventListener( 'mouseup', stopDrag, false )      
      }

      function setNearViewPoint(event) {
        // Creates a vector representing the position of the mouse
        // relative to the viewport coordinates: x, y  in range -1 - 1
        // z at 0 (flush with screen)

        nearViewPoint.x = (event.clientX / viewWidth) * 2 - 1
        nearViewPoint.y = 1 - (event.clientY / viewHeight) * 2
        //nearViewPoint.z = 0 // never changes
      }

      function getWorldViewPoint(event, z) {
        var viewPoint = getViewPoint(event, z)
        viewPoint.unproject(camera)
        return viewPoint
      }

      setCameraRay = function setCameraRay(event) {
        setNearViewPoint(event)
        farViewPoint.copy(nearViewPoint).z = 1

        nearWorldPoint.copy(nearViewPoint)
                      .applyProjection(viewToWorldMatrix)
        farWorldPoint.copy(farViewPoint)
                      .applyProjection(viewToWorldMatrix)

        mouseWorldVector.subVectors(farWorldPoint, nearWorldPoint)
        cameraRay.origin = nearWorldPoint
        cameraRay.direction = mouseWorldVector


    //     var matrix;

    // return function unproject( camera ) {

    //   if ( matrix === undefined ) matrix = new THREE.Matrix4();

    //   matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
    //   return this.applyProjection( matrix );

    // };
        return cameraRay
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

THREE.Ray.prototype.closestPointToRay = function ( that ) {
  var p = this.direction.dot(that.direction);
  var s = this.direction.lengthSq();
  var t = that.direction.lengthSq();

  var divisor = (s * t - p * p)

  if ( Math.abs( divisor ) < Number.EPSILON){ //THREE.Epsilon ) {
    // The two rays are colinear. They are "closest" at all points
    return null;
  }

  // Only calculate these if we need to...
  var c = that.origin.clone().sub(this.origin);
  var q = this.direction.dot(c);
  var r = that.direction.dot(c);

  return (q * t - p * r) / divisor;
}

function test() {
  var dragPosition = new THREE.Vector3(298.3784484863281, 393.0183410644531, -342.84564567301237)
  var dragDirection = new THREE.Vector3(0, 0, 1)
  var dragRay = new THREE.Ray(dragPosition, dragDirection)

  var y = 100
  for (var x = 638; x < 641; x += 1) {
    var cameraRay = setCameraRay ({ clientX: x, clientY: y })
    var scalar = dragRay.closestPointToRay(cameraRay)
    console.log(x, scalar)
  }
}

window.onload = init
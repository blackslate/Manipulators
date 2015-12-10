var cube
var camera

function init() {
  var scene = new THREE.Scene()
  var renderer = new THREE.WebGLRenderer()

  var cameras = []
  var SIDE = 100
  var RADIUS = Math.sqrt((SIDE/2 * SIDE/2) * 3)
  var WIDTH = window.innerWidth
  var HEIGHT = window.innerHeight

  // For mouse interactions
  var rotationMatrix = new THREE.Matrix4()
  var start = new THREE.Vector3()
  var end = new THREE.Vector3() 
  var angle
  var centreX
  var centreY
  var radius
  var radius2

  ;(function createOrthographicCamera(){
    camera = new THREE.OrthographicCamera(
     -RADIUS, RADIUS
    , RADIUS, -RADIUS
    , -RADIUS, RADIUS
    )

    var side = Math.min(WIDTH, HEIGHT)
    camera.viewport = { 
      x: (WIDTH - side) / 2
    , y: (HEIGHT - side) / 2
    , width: side
    , height: side
    }
    camera.matrixAutoUpdate = false
    cameras.push(camera)

    centreX = WIDTH/2
    centreY = HEIGHT/2
    radius = side/2
    radius2 = radius * radius
  })()

  ;(function createCubeAndSphere(){
    // Something to look at
    cube = new THREE.Object3D()

    var cubeGeometry = new THREE.BoxGeometry( SIDE, SIDE, SIDE )
    var lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    , transparent: true
    , opacity: 0.5
    })
    var faceMaterial = new THREE.MeshPhongMaterial({
      color: 0x006699
    , emissive: 0x072534
    , shading: THREE.FlatShading
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

    cube.add(new THREE.AxisHelper(RADIUS))
    scene.add( cube );

    var sphereGeometry = new THREE.SphereGeometry( RADIUS, 36, 36)
    var sphereMaterial = new THREE.MeshBasicMaterial( {
      color: 0x000000
    , transparent: true
    , opacity: 0.2
    } )
    var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial )
    scene.add( sphere )
  })()

  ;(function initializeRenderer(){
    renderer.setClearColor(new THREE.Color(0xEEEEFF))
    renderer.setSize(WIDTH, HEIGHT)
    renderer.autoClear = false;

    document.getElementById("WebGL-output").appendChild(renderer.domElement)
  })()

  ;(function render() {
    var viewport
    renderer.setViewport( 0, 0, WIDTH, HEIGHT );
    renderer.clear();

    
    cameras.forEach(function (camera) {
      viewport = camera.viewport // custom property
      renderer.setViewport(
        viewport.x
      , viewport.y
      , viewport.width
      , viewport.height
      )
      renderer.render(scene, camera)
    })

    requestAnimationFrame(render)
  })()

  window.addEventListener("mousedown", startDrag, false)

  function startDrag(event) {
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
      start.cross(end).normalize()
      rotationMatrix.makeRotationAxis(start, -angle)
      camera.matrix.multiply(rotationMatrix)
      camera.matrixWorldNeedsUpdate = true
      controlCamera.matrix.multiply(rotationMatrix)
      controlCamera.matrixWorldNeedsUpdate = true

      start.copy(end)
    }

    function stopDrag(event) {
      window.removeEventListener("mousemove", drag, false)
      window.removeEventListener("mouseup", stopDrag, false)      
    }
  }
}

window.onload = init
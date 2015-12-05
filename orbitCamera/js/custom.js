var camera

function init() {
  var scene = new THREE.Scene()
  var renderer = new THREE.WebGLRenderer()
  var cameras = []

  var WIDTH = window.innerWidth
  var HEIGHT = window.innerHeight

  ;(function createPerspectiveCamera(){
    var FOV = 45
    var ASPECT = WIDTH / HEIGHT
    var NEAR = 1
    var FAR = 360
    camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR)

    camera.position.x = 100
    camera.position.y = 100
    camera.position.z = 100
    camera.viewport = { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    camera.lookAt(scene.position)
    cameras.push(camera)
  })()

  ;(function initializeRenderer(){
    renderer.setClearColor(new THREE.Color(0xEEEEFF))
    renderer.setSize(WIDTH, HEIGHT)
    renderer.autoClear = false;

    document.getElementById("WebGL-output").appendChild(renderer.domElement)

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
  })()

  ;(function createCameraController(){
    var viewport = {
      x: WIDTH - 100
    , y: HEIGHT - 100
    , width: 100
    , height: 100
    }
    var circle = {
      x: WIDTH - 50
    , y: 50
    , radius: 50
    }
    var settings = {
      viewport: viewport
    , circle: circle
    }
    addCameraController(scene, camera, cameras, settings)
  })()

  // Something to look at
  scene.add(new THREE.AxisHelper(70))
}

window.onload = init
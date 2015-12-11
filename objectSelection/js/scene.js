;(function initializeScene(window){
  var context = window.context || (window.context = {})

  // Shared via context
  var scene = context.scene = new THREE.Scene()
  // In camera.js, custom.js, manipulator.js
  var camera // camera.js, manipulator.js
  var cameras = context.cameras = [] // camera.js

  // local only
  var WIDTH = context.WIDTH = window.innerWidth
  var HEIGHT = context.HEIGHT = window.innerHeight

  ;(function createPerspectiveCamera(){
    var FOV = 45
    var ASPECT = WIDTH / HEIGHT
    var NEAR = 1
    var FAR = 3000

    camera = context.camera = new THREE.PerspectiveCamera(
      FOV
    , ASPECT
    , NEAR
    , FAR
    )

    camera.position.z = 100
    camera.viewport = { x: 0, y: 0, width: WIDTH, height: HEIGHT }
    cameras.push(camera)
  })()

  ;(function initializeRenderer(){
    var renderer = new THREE.WebGLRenderer()
    var clearColor = new THREE.Color(0xEEEEFF)
    renderer.setClearColor(clearColor)
    renderer.setSize(WIDTH, HEIGHT)
    renderer.autoClear = false;

    document.getElementById("WebGL-output").appendChild(renderer.domElement)

    ;(function render() {
      var viewport
      renderer.setViewport( 0, 0, WIDTH, HEIGHT )
      //renderer.setClearColor(clearColor)
      renderer.clear()

      cameras.forEach(function (camera) {
        viewport = camera.viewport // custom property
        renderer.setViewport(
          viewport.x
        , viewport.y
        , viewport.width
        , viewport.height
        )
        
        if (camera.scene) {
          renderer.render(camera.scene, camera)
        } else {
          renderer.render(scene, camera)
        }
      })

      requestAnimationFrame(render)
    })()
  })()
})(window)
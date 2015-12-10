//;(function (){
  var container, scene, renderer, p

  var VIEW_WIDTH
    , VIEW_HEIGHT

  // custom variables
  var perspectiveCamera
    , topCamera
    , frontCamera
    , sideCamera

  var viewToWorld = new THREE.Matrix4() // set by setViewToWorldMatrix()

  // Lines
  var helpVector1 = new THREE.Vector3()
  var helpVector2 = new THREE.Vector3()
  var helpVector3 = new THREE.Vector3()
  var nearPoint = new THREE.Vector3()
  var farPoint = new THREE.Vector3()
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000
  })
  var mouseLineGeometry = new THREE.Geometry();
  var mouseLine = new THREE.Line(mouseLineGeometry, lineMaterial) 
  var mouseRay = new THREE.Ray() 
  var cubeRay = new THREE.Ray()
  var cubePosition = new THREE.Vector3()
  var ballPosition = new THREE.Vector3()
  var selection = []
  var cube
    , ball

  // FUNCTIONS    
  ;(function init() {
    // SCENE
    var div = document.querySelector("#ThreeJS")
    p = document.querySelector("#distance")

    scene = new THREE.Scene();

    ;(function createCameras(){
      VIEW_WIDTH = div.clientWidth
      VIEW_HEIGHT = div.clientHeight
      var VIEW_ANGLE = 53.13 // frustrum height = FAR
        , ASPECT = VIEW_WIDTH / VIEW_HEIGHT
        , NEAR = 1
        , FAR = 21;
      // perspective cameras
      perspectiveCamera = new THREE.PerspectiveCamera(
        VIEW_ANGLE
      , ASPECT
      , NEAR
      , FAR)

      perspectiveCamera.position.set(0,0,11);
      perspectiveCamera.lookAt(scene.position);
      setViewToWorldMatrix()

      // orthographic cameras
      topCamera = new THREE.OrthographicCamera(
        VIEW_WIDTH / -4,   // Left
        VIEW_WIDTH / 4,    // Right
        VIEW_HEIGHT / 4,   // Top
        VIEW_HEIGHT / -4,  // Bottom
        -200,             // Near 
        200 );            // Far -- enough to see the skybox
      topCamera.up = new THREE.Vector3(0,0,-1);
      topCamera.lookAt( new THREE.Vector3(0,-1,0) );
      topCamera.zoom = 10
      topCamera.updateProjectionMatrix ()
      
      frontCamera = new THREE.OrthographicCamera(
        VIEW_WIDTH / -4, VIEW_WIDTH / 4,    
        VIEW_HEIGHT / 4, VIEW_HEIGHT / -4,  
        -200, 200 );                 
      frontCamera.lookAt( new THREE.Vector3(0,0,-1) );
      frontCamera.zoom = 10
      frontCamera.updateProjectionMatrix ()
      
      sideCamera = new THREE.OrthographicCamera(
        VIEW_WIDTH / -4, VIEW_WIDTH / 4,    
        VIEW_HEIGHT / 4, VIEW_HEIGHT / -4,  
        -200, 200 );                 
      sideCamera.lookAt( new THREE.Vector3(1,0,0) );
      sideCamera.zoom = 10
      sideCamera.updateProjectionMatrix ()
    })()
    
    ;(function createRenderer(){
      renderer = new THREE.WebGLRenderer( {antialias:true} );
      renderer.setSize(VIEW_WIDTH, VIEW_HEIGHT);
      renderer.setClearColor( 0xcccccc, 1 );
      renderer.autoClear = false;

      container = document.getElementById( 'ThreeJS' );
      container.appendChild( renderer.domElement );
    })()
    
    ;(function createScenery(){
      // LIGHT
      var light = new THREE.PointLight(0xffffff);
      light.position.set(0,250,0);
      scene.add(light);
      
      scene.add( new THREE.AxisHelper(100) ); 

      // CUBE
      var cubeGeometry = new THREE.BoxGeometry(1,1,1)
      var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
      var cubeLineGeometry = new THREE.Geometry();
      cubeLineGeometry.vertices.push(new THREE.Vector3(0, 0, -20))
      cubeLineGeometry.vertices.push(new THREE.Vector3(0, 0, 20))
      var cubeLine = new THREE.Line(cubeLineGeometry, lineMaterial)
      cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      cube.add(cubeLine)

      // cube.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
      cube.position.x = -4
      cube.position.y = 3
      cube.position.z = 0
      
      scene.add(cube)

      // cube.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
      cube.position.x = -4
      cube.position.y = 3
      cube.position.z = 0
      
      scene.add(cube)

      // CYLINDER
      var cylinderGeometry = new THREE.CylinderGeometry(5,5,100, 36)
      var cylinderMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00
      , transparent: true
      , opacity: 0.2
      , wireframe: false
      , side: THREE.BackSide
      })
      cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
      cylinder.position.copy(cube.position)
      cylinder.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2)
      cylinder.name = "Cylinder"
      scene.add(cylinder)

      // NORMAL PLANE
      var planeGeometry = new THREE.PlaneGeometry(32, 100)
      var planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00cccc
      , transparent: true
      , opacity: 0.2
      , side: THREE.DoubleSide
      })
      var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.position.copy(cube.position)
      plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2)
      plane.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.atan2(4, 3))
      plane.name = "Plane"
      scene.add(plane)

      selection.push(cylinder) //, plane)

      // SPHERE
      var ballGeometry = new THREE.SphereGeometry(1,3,2)
      var ballMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true})
      ball = new THREE.Mesh(ballGeometry, ballMaterial)

      scene.add(ball)
    })()

    ;(function createFrustrum(){
      var nbl = new THREE.Vector3().set(-1, -1, -1)
                                   .applyProjection(viewToWorld)
      var nbr = new THREE.Vector3().set( 1, -1, -1)
                                   .applyProjection(viewToWorld)
      var ntl = new THREE.Vector3().set(-1,  1, -1)
                                   .applyProjection(viewToWorld)
      var ntr = new THREE.Vector3().set( 1,  1, -1)
                                   .applyProjection(viewToWorld)
      var fbl = new THREE.Vector3().set(-1, -1,  1)
                                   .applyProjection(viewToWorld)
      var fbr = new THREE.Vector3().set( 1, -1,  1)
                                   .applyProjection(viewToWorld)
      var ftl = new THREE.Vector3().set(-1,  1,  1)
                                   .applyProjection(viewToWorld)
      var ftr = new THREE.Vector3().set( 1,  1,  1)
                                   .applyProjection(viewToWorld)

      var leftMtl = new THREE.MeshBasicMaterial({
        color: 0xffcccc
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })
      var rightMtl = new THREE.MeshBasicMaterial({
        color: 0x330000
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })
      var topMtl = new THREE.MeshBasicMaterial({
        color: 0xccffcc
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })
      var bottomMtl = new THREE.MeshBasicMaterial({
        color: 0x003300
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })
      var nearMtl = new THREE.MeshBasicMaterial({
        color: 0xccccff
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })
      var farMtl = new THREE.MeshBasicMaterial({
        color: 0x000033
      , transparent: true
      , opacity: 0.5
      , side: THREE.DoubleSide
      })

      createMesh([nbr, fbr, ftr, ntr], rightMtl)
      createMesh([nbl, fbl, ftl, ntl], leftMtl)
      createMesh([ntl, ntr, ftr, ftl], topMtl)
      createMesh([nbl, nbr, fbr, fbl], bottomMtl)
      createMesh([nbl, nbr, ntr, ntl], nearMtl)
      createMesh([fbl, fbr, ftr, ftl], farMtl)

      function createMesh (corners, material) {
        var geometry = new THREE.Geometry()
        var vertices = geometry.vertices

        corners.forEach(function (corner) {
          vertices.push(corner)
        })

        geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
        geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

        var object = new THREE.Mesh( geometry, material );
        scene.add(object);
      }
    })()

    container.addEventListener("mousedown", startDrag, false)
   
    animate();
  })()

  function startDrag(event) {
    // Find boundaries of top left quadrant
    var rect = container.getBoundingClientRect()
    var width = rect.width / 2
    var height = rect.height / 2
    rect.right = rect.left + width
    rect.bottom = rect.top + height

    var mouse = {}
    constrainMouseToRect(event, true) // // check if in tl quadrant
    if (mouse.outOfBounds) {
      return
    }

    var raycaster = new THREE.Raycaster()
    var intersects

    window.addEventListener("mousemove", drag, false)
    window.addEventListener("mouseup", stopDrag, false)

    updateMouseLine(mouse)

    function constrainMouseToRect(event, setOutOfBounds) {
      var x = event.clientX - rect.left
      var y = event.clientY - rect.top

      if (!setOutOfBounds) {
        x = Math.max(0, Math.min(x, width))
        y = Math.max(0, Math.min(y, height))
      } else if (x < 0 || x > width || y < 0 || y > height) {
        mouse.outOfBounds = true
        return
      }

      mouse.x = 2 * x / width - 1
      mouse.y = 1 - 2 * y / height
    }

    function updateMouseLine(mouse) {
      nearPoint.x = mouse.x
      nearPoint.y = mouse.y
      nearPoint.z = -1 // near plane

      raycaster.setFromCamera( mouse, perspectiveCamera )
      intersects = raycaster.intersectObjects ( selection )

      farPoint.copy(nearPoint).z = 1

      nearPoint.applyProjection(viewToWorld)
      farPoint.applyProjection(viewToWorld)

      mouseLineGeometry.vertices.length = 0
      mouseLineGeometry.vertices.push(nearPoint)
      mouseLineGeometry.vertices.push(farPoint)

      mouseLine.geometry.verticesNeedUpdate = true
      scene.add(mouseLine)
    }

    function moveCubeToClosestPointOnRay() {
      var matrix = cube.matrixWorld
      cubePosition.setFromMatrixPosition(matrix)
      cubeRay.origin.copy(cubePosition)
      matrix.extractBasis(helpVector1, helpVector2, helpVector3)
      cubeRay.direction.copy(helpVector3)

      mouseRay.origin.copy(nearPoint)    
      mouseRay.direction.copy(helpVector1.subVectors(farPoint, nearPoint))

      var delta = cubeRay.closestPointToRay(mouseRay)
      cubePosition.addScaledVector(helpVector3, delta)
      cube.position.copy(cubePosition)

      delta = mouseRay.closestPointToRay(cubeRay)
      ballPosition.copy(nearPoint).addScaledVector(helpVector1, delta)
      ball.position.copy(ballPosition)

      var distance = ballPosition.distanceTo(cubePosition)
      p.innerHTML = distance + getIntersects()

      function getIntersects() {
        var string = ""

        intersects.forEach(function (data) {
          string += "<br>" + data.object.name + ": " + data.distance
        })

        return string
      }

    }
 
    function drag(event) {
      constrainMouseToRect(event)
      updateMouseLine(mouse)
      moveCubeToClosestPointOnRay()
    }

    function stopDrag(event) {
      window.removeEventListener("mousemove", drag, false)
      window.removeEventListener("mouseup", stopDrag, false)
    }
  }

  function setViewToWorldMatrix() {
    perspectiveCamera.updateMatrixWorld()
    viewToWorld.multiplyMatrices(
      perspectiveCamera.matrixWorld
    , viewToWorld.getInverse( perspectiveCamera.projectionMatrix )
    )
  }

  function animate() {
    requestAnimationFrame( animate );
    render();   
  }

  function render() {
    // setViewport parameters:
    //  lower_left_x, lower_left_y, viewport_width, viewport_height
    renderer.setViewport( 0, 0, VIEW_WIDTH, VIEW_HEIGHT );
    renderer.clear();
    
    // upper left corner
    renderer.setViewport(
      1
    , 0.5 * VIEW_HEIGHT + 1
    , 0.5 * VIEW_WIDTH - 2
    , 0.5 * VIEW_HEIGHT - 2 );
    renderer.render( scene, perspectiveCamera );
    
    // upper right corner
    renderer.setViewport(
      0.5 * VIEW_WIDTH + 1
    , 0.5 * VIEW_HEIGHT + 1
    , 0.5 * VIEW_WIDTH - 2
    , 0.5 * VIEW_HEIGHT - 2 );
    renderer.render( scene, topCamera );
    
    // lower left corner
    renderer.setViewport(
      1
    , 1
    , 0.5 * VIEW_WIDTH - 2
    , 0.5 * VIEW_HEIGHT - 2 );
    renderer.render( scene, sideCamera );
    
    // lower right corner
    renderer.setViewport(
      0.5 * VIEW_WIDTH + 1
    , 1
    , 0.5 * VIEW_WIDTH - 2
    , 0.5 * VIEW_HEIGHT - 2 );
    renderer.render( scene, frontCamera );
  }
//})()

THREE.Ray.prototype.closestPointToRay = function (that) {
  var p = this.direction.dot(that.direction)
  var s = this.direction.lengthSq()
  var t = that.direction.lengthSq()

  var divisor = (s * t - p * p)

  if (Math.abs(divisor) < Number.EPSILON) {
    // The two rays are colinear. They are "closest" at all points
    return
  }

  var c = that.origin.clone().sub(this.origin)
  var q = this.direction.dot(c)
  var r = that.direction.dot(c)

  return (q * t - p * r) / divisor
}
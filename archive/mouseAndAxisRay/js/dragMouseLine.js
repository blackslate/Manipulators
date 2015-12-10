//;(function (){
  var container, scene, renderer

  var VIEW_WIDTH
    , VIEW_HEIGHT

  // custom variables
  var perspectiveCamera
    , topCamera
    , frontCamera
    , sideCamera

  var viewToWorld = new THREE.Matrix4() // set by setViewToWorldMatrix()

  // Lines
  var nearPoint = new THREE.Vector3()
  var farPoint = new THREE.Vector3()
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x000000
  })
  var mouseLineGeometry = new THREE.Geometry();
  var mouseLine = new THREE.Line(mouseLineGeometry, lineMaterial)

  // FUNCTIONS    
  ;(function init() {
    // SCENE
    var div = document.querySelector("#ThreeJS")
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

    function drag(event) {
      constrainMouseToRect(event)
      updateMouseLine(mouse)
    }

    function updateMouseLine(mouse) {
      nearPoint.x = mouse.x
      nearPoint.y = mouse.y
      nearPoint.z = -1 // near plane

      farPoint.copy(nearPoint).z = 1

      nearPoint.applyProjection(viewToWorld)
      farPoint.applyProjection(viewToWorld)

      mouseLineGeometry.vertices.length = 0
      mouseLineGeometry.vertices.push(nearPoint)
      mouseLineGeometry.vertices.push(farPoint)

      mouseLine.geometry.verticesNeedUpdate = true
      scene.add(mouseLine)
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
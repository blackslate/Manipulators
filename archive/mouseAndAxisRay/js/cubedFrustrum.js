//;(function (){
  var container, scene, renderer

  // custom variables
  var perspectiveCamera
    , topCamera
    , frontCamera
    , sideCamera

  var viewToWorld = new THREE.Matrix4() // set by setViewToWorldMatrix()
  var helperVector = new THREE.Vector3()

  var VIEW_WIDTH
    , VIEW_HEIGHT

  init();
  animate();


  // FUNCTIONS    
  function init() {
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
      renderer.setClearColor( 0xffeeee, 1 );
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
      var cubeGeometry = new THREE.BoxGeometry(0.2,0.2,0.2)
      var bigGeometry = new THREE.BoxGeometry(2,2,2)
      var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
      // NEAR
      var cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      helperVector.set(-1, -1, -1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      helperVector.set(1, -1, -1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      helperVector.set(1, 1, -1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
      helperVector.set(-1, 1, -1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)
      //FAR
      cube = new THREE.Mesh(bigGeometry, cubeMaterial)
      helperVector.set(-1, -1, 1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(bigGeometry, cubeMaterial)
      helperVector.set(1, -1, 1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(bigGeometry, cubeMaterial)
      helperVector.set(1, 1, 1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)

      cube = new THREE.Mesh(bigGeometry, cubeMaterial)
      helperVector.set(-1, 1, 1).applyProjection(viewToWorld)
      cube.position.copy(helperVector)
      scene.add(cube)
    })()
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
;(function (THREE){
  function init() {
    var NORMAL = new THREE.Vector3(1, 0, 0) //<HARD-CODED for testing>
    var selection = []
    var scene = new THREE.Scene();

    // Create a perspective camera
    var viewAngle = 45
    var width = window.innerWidth
    var height = window.innerHeight
    var ratio = width / height
    var near = 0.1
    var far = 100000
    var camera = new THREE.PerspectiveCamera(viewAngle, ratio, near, far);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    renderer.setSize(width, height);

    // show axes in the screen
    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 20);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc})
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // position the cube
    cube.position.x = -4;
    cube.position.y = 3;
    cube.position.z = 0;

    // add the cube to the scene
    scene.add(cube);

    // create a sphere
    var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // position the sphere
    sphere.position.x = 20;
    sphere.position.y = 4;
    sphere.position.z = 2;

    // add the sphere to the scene
    scene.add(sphere);

    selection.push(sphere, cube)

    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);
    camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    document.getElementById("WebGL-output").appendChild(renderer.domElement);

    ;(function createObjectManipulator(scene, camera){
      var plane

      function createViewPortPlane() {
        // Add the camera to the scene so that its children are
        // in the scene
        scene.add(camera)

        // Create an invisible plane that will fill the view of 
        // the perspective camera. For an orthographic camera,
        //  the plane will have different scaling.
        var side = 2000
        var segments = 20
        var planeGeometry = new THREE.PlaneBufferGeometry(side, side, segments, segments)
        var planeMaterial = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true})
        plane = new THREE.Mesh(planeGeometry, planeMaterial)

        //plane.visible = false
        
        // viewAngle is vertical angle of camera frustrum. Use
        // half the angle to place the plane at the point where
        // it fills the viewport
        var angle = camera.fov * Math.PI / 360
        var distance = side / 2 / Math.tan(angle)
        camera.add(plane)
        plane.translateZ(-distance)
        plane.scale.x = camera.aspect
      }

      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      var pointOnPlane = new THREE.Vector3()
      var dragPoint = new THREE.Vector3() // click point on selection
      var dragVector = new THREE.Vector3()
      var lastDistance = 0
      var intersects
        , ratio
        , secondPoint
        , distanceToPlane
        , translation

      function startTranslation( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera )
        selection.push(plane)
        intersects = raycaster.intersectObjects ( selection )
        selection.pop()
        if (intersects.length < 2) {
          // The user did not click on one of the selected objects
          // so we ignore the drag. In the future, we might use the
          // centre of gravity of the selection instead.
          return
        }

        setIntersectionPoints(intersects)

        function setIntersectionPoints(intersects) {
          var dragDistance = -1
          var planeDistance

          intersects.forEach(function (intersectionObject) {
            if ( intersectionObject.object === plane ) {
              pointOnPlane = intersectionObject.point
              planeDistance = intersectionObject.distance
            } else if (dragDistance < 0) {
              dragPoint = intersectionObject.point
              dragDistance = intersectionObject.distance
            }
          })
          
          ratio = dragDistance / planeDistance
        }

        function moveSelectionAlongAxis( mouse ) {
          raycaster.setFromCamera( mouse, camera )
          intersects = raycaster.intersectObject ( plane )
          secondPoint = intersects[0].point
          //console.log(mouse.x, mouse.y, secondPoint)
          dragVector.subVectors(secondPoint, pointOnPlane)
          distanceToPlane = dragVector.dot(NORMAL)
          if (distanceToPlane) {
              console.log(distanceToPlane)
          }
          translation = (distanceToPlane - lastDistance) * ratio
          lastDistance = distanceToPlane

          console.log(distanceToPlane, translation)

          selection.forEach(function (object) {
            object.translateOnAxis ( NORMAL, translation )
          })
          
          // { distance: 2588.5620353598674
          // , face: THREE.Face3
          // , faceIndex: null
          // , object: THREE.Mesh
          // , point: THREE.Vector3 {
          //   , x: 879.3006373113469
          //   , y: -1266.2009930793445
          //   , z: -2011.4859116756434
          //   }
          // }
        }

        window.addEventListener( 'mousemove', translate, false );
        window.addEventListener( 'mouseup', stopTranslation, false )

        function translate(event) {
          mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
          moveSelectionAlongAxis(mouse)
        }

        function stopTranslation() {
          window.removeEventListener( 'mousemove', translate );
          window.removeEventListener( 'mouseup', stopTranslation );
        }
      }

      // mouse.x and y are now values between -1 and +1, with 0,0 at the centre of the window.

      // function render() {
      //   // update the picking ray with the camera and mouse position
      //   raycaster.setFromCamera( mouse, camera );
      //   // calculate objects intersecting the picking ray
      //   var intersects = raycaster.intersectObjects( scene.children );
      //   for ( var i = 0; i < intersects.length; i++ ) {
      //     intersects[ i ].object.material.color.set( 0xff0000 );
      //   }

      // }

      window.addEventListener( 'mousedown', startTranslation, false );

      createViewPortPlane()
      render()

    })(scene, camera)

    function render() {
      renderer.render(scene, camera);
      requestAnimationFrame(render)
    }

  }
  window.onload = init;
})(THREE)
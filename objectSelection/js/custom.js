"use strict"

var monolith

;(function customScene(window){
  var context = window.context || (window.context = {})

  context.createCustomScene = function createCustomScene() {
    var context = window.context
    var scene = context.scene
    var dragHelpers = context.dragHelpers || (context.dragHelpers = {})
    var selectableObjects = context.selectableObjects
                        || (context.selectableObjects = [])

    ;(function setCameraPosition(){
      var camera = context.camera

      camera.position.x = 500
      camera.position.y = 700
      camera.position.z = 1300
      camera.lookAt(context.scene.position)
      //camera.updateMatrixWorld()
    })()

    ;(function createWorldPlanes(){
      // create the ground plane
      var planeGeometry = new THREE.PlaneGeometry(1000, 1000)
      var yellowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00
      , opacity: 0.1
      , transparent: true
      , side: THREE.DoubleSide
      })
      var cyanMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff
      , opacity: 0.1
      , transparent: true
      , side: THREE.DoubleSide
      })
      var magentaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff
      , opacity: 0.1
      , transparent: true
      , side: THREE.DoubleSide
      })
      var xyPlane = new THREE.Mesh(planeGeometry, yellowMaterial)
      xyPlane.name = "xy"
      scene.add(xyPlane)

      var yzPlane = new THREE.Mesh(planeGeometry, cyanMaterial)
      yzPlane.rotation.y = 0.5 * Math.PI
      yzPlane.name = "yz"
      scene.add(yzPlane)

      var xzPlane = new THREE.Mesh(planeGeometry, magentaMaterial)
      xzPlane.rotation.x = -0.5 * Math.PI
      xzPlane.name = "xz"
      scene.add(xzPlane)

      scene.add(new THREE.AxisHelper(600))
    })()

    // ;(function createDragHelpers() {     
    //   // Plane to which dragging is constrained
    //   var planeGeometry = new THREE.PlaneGeometry( 1000, 1000 );
    //   var planeMaterial = new THREE.MeshBasicMaterial({
    //     color: 0x000000
    //   , side: THREE.DoubleSide
    //   , transparent: true
    //   , opacity: 0.2
    //   } )
    //   dragPlane = new THREE.Mesh( planeGeometry, planeMaterial )
    //   dragPlane.name = "drag"
    //   dragPlane.visible = false

    //   // Axis along which dragging is constrained
    //   var lineGeometry = new THREE.Geometry();
    //   var lineMaterial = new THREE.LineBasicMaterial({
    //     color: 0x000000
    //   })
    //   lineGeometry.vertices.push(new THREE.Vector3(0, 1000, 0))
    //   lineGeometry.vertices.push(new THREE.Vector3(0, -1000, 0))
    //   dragLine = new THREE.Line(lineGeometry, lineMaterial)
    //   dragLine.visible = false

    //   // Axis of selected object
    //   dragAxis = new THREE.AxisHelper(100)
    //   dragAxis.visible = false

    //   dragHelpers.dragPlane = dragPlane
    //   dragHelpers.dragLine = dragLine
    //   dragHelpers.dragAxis = dragAxis
    // })()

    ;(function creatSelectableModels() {
      var surfaceMaterial = new THREE.MeshBasicMaterial({
        color: 0x006699
      , wireframe: false})
      var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff
      , transparent: false
      , opacity: 0.5
      })

      // Monolith
      var object = new THREE.Object3D()
      var geometry = new THREE.BoxGeometry(50, 50, 50)
      var model = new THREE.Mesh(geometry, surfaceMaterial)
      object.add(model)
      object.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry( geometry )
        , lineMaterial
        )
      )
      var boundingBox = new THREE.BoxHelper(model)
      boundingBox.name = "boundingBox"
      boundingBox.visible = false
      object.add(boundingBox)
      object.position.y = 225
      object.scale.x = 4
      object.scale.y = 9

      object.name = "Monolith"
      scene.add(object)
      selectableObjects.push(object)

      // Cone
      object = new THREE.Object3D()
      geometry = new THREE.CylinderGeometry(0, 100, 200)    
      model = new THREE.Mesh(geometry, surfaceMaterial)
      object.add(model)
      object.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry( geometry )
        , lineMaterial
        )
      )
      boundingBox = new THREE.BoxHelper(model)
      boundingBox.name = "boundingBox"
      boundingBox.visible = false
      object.add(boundingBox)
      object.position.x = 400
      object.position.y = 100
      object.position.z = 200
      object.rotation.z = Math.PI / 6
      object.rotation.y = Math.PI / 4
      object.name = "Cone"
      scene.add(object)
      selectableObjects.push(object)

      // Torus
      object = new THREE.Object3D()
      geometry = new THREE.TorusGeometry( 100, 30, 4, 12 )    
      model = new THREE.Mesh(geometry, surfaceMaterial)
      object.add(model)
      object.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry( geometry )
        , lineMaterial
        )
      )
      boundingBox = new THREE.BoxHelper(model)
      boundingBox.name = "boundingBox"
      boundingBox.visible = false
      object.add(boundingBox)
      object.rotation.x = -Math.PI / 4
      object.scale.y = 1.5
      object.position.z = 333
      object.name = "Torus"
      scene.add(object)
      selectableObjects.push(object)
    })()
  }
})(window)
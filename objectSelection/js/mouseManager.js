/**
 The mouseManager listens for mouse events and dispatches them to the
 appropriate functions. Functions that have been added to the 
 mouseAction.events.mousedown array will be treated first. Any function in that array that returns `true` will prevent any further
 treatment of the event.

 For example, a mousedown on the trackball camera will only be used to
 start a rotation of the camera.

 If the event is not stopped, then the mouseManager will check on the current action mode (selection|rotation|scale|translation) and call the appropriate function.

ASSUMES that window.context contains:
* mouseActions object, possibly with .events.mousedown array
* camera with viewport.WIDTH and HEIGHT
* action
**/

;(function createMouseManager(window){
  var context = window.context || (window.context = {})
  var viewPoint = new THREE.Vector3()
  var raycaster = new THREE.Raycaster()
  var selection = []
  var mouseActions // { <actionName>: <function>, ... }
  var mouseDownActions // [ <function>, ... ]

  window.addEventListener("mousedown", mouseDown, false)

  function mouseDown(event) {
    var stopEvent = false
    var targetData
    var action

    if (!mouseActions) {
      mouseActions = context.mouseActions
      if (!mouseActions) {
        return
      }
    }

    if (!mouseDownActions) {
      mouseDownActions = mouseActions.events.mousedown
    }

    if (mouseDownActions) {
      // Call each mousedown action in turn until one returns 
      // true, meaning "prevent any further action"
      mouseDownActions.every(function (action) {
        stopEvent = action(event)
        return !stopEvent
      })       
    }

    if (!stopEvent) {
      targetData = getTargetData(event) // may be undefined
      selection.length = 0

      if (context.selection && context.selection.update) {
        context.selection.update(
          targetData ? targetData.target : undefined
        , event.shiftKey)
        context.selection.get(selection)
      } else if (targetData) {
        selection.push(targetData.target)
      }

      // <DEBUGGING>
      selection.forEach(function (selectedObject) {
        console.log (selectedObject.name)
      })
      // </DEBUGGING>

      action = mouseActions[context.action]
      if (action) {
        action( targetData, selection, event )
      }
    }
  }

  function getTargetData(event) {
    var camera = context.camera
    var width = camera.viewport.width
    var height = camera.viewport.height
    var selectableObjects = context.selectableObjects
    var intersects // array of intersection data objects
    var targetData // intersection data object | undefined
    var target

    viewPoint.x = (event.clientX / width) * 2 - 1
    viewPoint.y = 1 - (event.clientY / height) * 2

    raycaster.setFromCamera( viewPoint, camera )
    intersects = raycaster.intersectObjects(selectableObjects, true)

    targetData = intersects[0] // may be undefined

    if (targetData) {
      target = targetData.object
      while (target && selectableObjects.indexOf(target) < 0) {
        target = target.parent
      }
      targetData.target = target
    }
    
    return targetData
  }  
  
})(window)
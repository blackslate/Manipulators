"use strict"

;(function createSelectionObject (window) {
  var context = window.context || (window.context = {})
  var selection = context.selection = {
    selected: []
  , publicSelection: []
  }

  selection.update = function update(object, shiftKeyDown) {
    var index = this.selected.indexOf(object)

    if (!shiftKeyDown) {
      if (index < 0) {
        deselectAll()
      } else {
        // The user clicked on an object that is already part of the
        // selection, in order to act on the selection as a whole.
        return
      }
    }

    if (object) {
      if (index > -1) {
        // Remove the current object from the selected array...
        this.selected.splice(index, 1)

        if (shiftKeyDown) {
          // ... and leave it out of the array
          return deselect(object)        
        }
      } else {
        select(object)
      }
 
      // Place the most recently selected object at index 0
      this.selected.unshift(object)
    }

    function deselectAll() {
      selection.selected.forEach(function (object) {
        deselect(object)
      })
      selection.selected.length = 0
    }

    function select(object) {
      var boundingBoxModel = getBoundingBoxModel(object)
      if (boundingBoxModel) {
        boundingBoxModel.visible = true
      }
    }

    function deselect(object) {
      var boundingBoxModel = getBoundingBoxModel(object)
      if (boundingBoxModel) {
        boundingBoxModel.visible = false
      }   
    }

    function getBoundingBoxModel(object) {
      var boundingBoxModel
      object.children.every(function (child) {
        if (child.name === "boundingBox") {
          boundingBoxModel = child
          return false
        }
        return true
      })
      return boundingBoxModel
    }
  }

  selection.get = function get( publicSelection ) {
    // Returns a copy of this.selected
    publicSelection ? null : publicSelection = this.publicSelection

    publicSelection.length = 0
    this.selected.forEach(function (selected) {
      publicSelection.push(selected)
    })

    return publicSelection
  }
})(window)
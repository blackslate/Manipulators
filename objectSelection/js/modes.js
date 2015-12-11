"use strict"

;(function defineMode(){
  var context = window.context || (window.context = {})

  function initialize() {
    window.removeEventListener("load", initialize, false)
    window.addEventListener( 'keydown', keyDown, false )
    window.addEventListener( 'keyup', keyUp, false )

    var action = document.querySelector("#action")
    var basis = document.querySelector("#basis")
    var freedom = document.querySelector("#freedom")
    var actions = {
      "t": "translate"
    , "r": "rotate"
    , "s": "scale"
    }
    var bases = {
      "w": "world"
    , "l": "local"
    , "v": "view"
    }
    var freedomTimeout = 0

    context.action = action.value
    context.basis = basis.value
    context.freedom = freedom.value

    basis.onchange = function (event) {
      context.basis = event.target.value
    }
    action.onchange = function (event) {
      context.action = event.target.value
      context.getGizmo()
    }
    freedom.onchange = function (event) {
      context.freedom = event.target.value
    }

    var keys = {
    // BASIS
      87: "w" // world
    , 76: "l" // local
    , 86: "v" // view
    // Dvorak
    ,188: "w" // , world
    , 78: "l" // n local
    , 75: "v" // k view

    // ACTION ypo
    , 84: "t" // translate
    , 82: "r" // rotate
    , 83: "s" // scale
    // // Dvorak
    , 77: "t" // m world
    , 80: "r" // p local
    , 79: "s" // o view

    // FREEDOM
    , 88: "x"
    , 67: "y" // c
    , 89: "y"
    , 90: "z"
      // Dvorak
    , 81: "x" // q
    , 74: "y" // j
    , 186: "z" // ;
    }
    var freedomKeys = "xyz"
    var keysUp = []
    var keysDown = []
 
    function keyDown(event) {
      var key = keys[event.keyCode]
      if (key && freedomKeys.indexOf(key) > -1) {
        var index = keysDown.indexOf(key)

        if (index < 0) {
          keysDown.push(key)
          keysDown.sort()
        }
      }
    }

    function keyUp(event) {
      var key = keys[event.keyCode]

      if (key) {
        if (keysDown.indexOf(key) > -1) {
          freedomKeyUp(key)
        } else {
          switch (key) {
            case "w":
            case "l":
            case "v":
              setContext(key, basis, bases)
            break
            case "t":
            case "r":
            case "s":
              setContext(key, action, actions)
            break
          }
        }
      }
    }

    function freedomKeyUp(key) {
      if (keysUp.indexOf(key) < 0) {
        keysUp.push(key)
        keysUp.sort()
      }

      if (!freedomTimeout) {
        freedomTimeout = window.setTimeout(checkIfAllKeysAreUp, 100)
      }
      
      function checkIfAllKeysAreUp() {
        var allKeysAreUp = (keysUp.length === keysDown.length)
        var index

        freedomTimeout = 0
         
        if (allKeysAreUp) {
          keysUp.every(function (key, index) {
            if (keysDown[index] !== key) {
              allKeysAreUp = false
            }
            return allKeysAreUp
          })
        }

        if (!allKeysAreUp) {
          // Ignore the keys that were just released
          keysDown = keysDown.filter(function (key) {
            if (keysUp.indexOf(key) < 0) {
              return true
            }
          })
        } else {
          context.freedom = keysDown.join("") || "xyz"
          keysDown.length = 0
          setContext(context.freedom , freedom)
        }

        keysUp.length = 0
      }
    }

    function setContext(value, element, lut) {
      if (lut) {
        value = lut[value]
      }

      var fakeEvent = { target: { value: value } }
      element.value = value
      // Force an update
      element.onchange(fakeEvent)
    }
  }

  window.addEventListener("load", initialize, false)
})(window)
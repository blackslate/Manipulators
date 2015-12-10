"use strict"

;(function defineMode(){
  var context = window.context || (window.context = {})

  function initialize() {
    window.removeEventListener("load", initialize, false)
    window.addEventListener( 'keyup', toggleFreedom, false )

    var action = document.querySelector("#action")
    var basis = document.querySelector("#basis")
    var freedom = document.querySelector("#freedom")

    context.action = action.value
    context.basis = basis.value
    context.freedom = freedom.innerHTML

    basis.onchange = function (event) {
      context.basis = event.target.value
    }
    action.onchange = function (event) {
      context.action = event.target.value
    }

    var keys = {
      88: "x"
    , 67: "y" // c
    , 86: "y" // v
    , 89: "y"
    , 90: "z"
      // DVORAK
    , 81: "x" // q
    , 74: "y" // j
    , 75: "y" // k
    , 186: "z" // ;
    }
    var freedomKeysPressed = []
 
    function toggleFreedom(event) {
      var key = keys[event.keyCode]

      if (key) {
        var index = freedomKeysPressed.indexOf(key)

        if (index < 0) {
          freedomKeysPressed.push(key)
          freedomKeysPressed.sort()
        } else {
          freedomKeysPressed.splice(index, 1)
        }

        context.freedom = freedomKeysPressed.join("") || "xyz"

        freedom.innerHTML = context.freedom
      }
    }
  }

  window.addEventListener("load", initialize, false)
})(window)
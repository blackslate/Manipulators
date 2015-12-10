function setClientPoint(event, clientPoint) {
  clientPoint.x = event.clientX || event.touches[0].clientX
  clientPoint.y = event.clientY || event.touches[0].clientY
}

function addListener(element, key, method) {
  switch (key) {
    case "start":
      element.addEventListener("mousedown", method, false)
      element.addEventListener("touchstart", method, false)
    break
    case "move":
      element.addEventListener("mousemove", method, false)
      element.addEventListener("touchmove", method, false)
    break
    case "stop":
      element.addEventListener("mouseup", method, false)
      element.addEventListener("touchend", method, false)
      element.addEventListener("touchcancel", method, false)
    break
  }
}

function removeListener(element, key, method) {
  switch (key) {
    case "start":
      element.removeEventListener("mousedown", method, false)
      element.removeEventListener("touchstart", method, false)
    break
    case "move":
      element.removeEventListener("mousemove", method, false)
      element.removeEventListener("touchmove", method, false)
    break
    case "stop":
      element.removeEventListener("mouseup", method, false)
      element.removeEventListener("touchend", method, false)
      element.removeEventListener("touchcancel", method, false)
    break
  }
}
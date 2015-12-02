var THREE = require('three');
var assert = require("assert");

THREE.Ray.prototype.closestPointToRay = function (that) {}
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

  return = (q * t - p * r) / divisor
}



describe('The THREE object', function() {
  it('should have a defined BasicShadowMap constant', function() {
    assert.notEqual('undefined', THREE.BasicShadowMap);
  }),

  it('should be able to construct a Vector3 with default of x=0', function() {
    var vec3 = new THREE.Vector3();
    assert.equal(0, vec3.x);
  })
})
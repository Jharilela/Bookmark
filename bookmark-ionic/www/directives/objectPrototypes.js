if (!Array.prototype.chunk) {
  Object.defineProperty(Array.prototype, 'chunk', {
    value: function(size) {
      var arr = this;
      var newArr = [];
      for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));
      }
      return newArr;
    }
  });
}
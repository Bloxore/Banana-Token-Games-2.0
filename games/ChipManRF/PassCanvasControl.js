let CanvasControl = {
  _freedCanvas: null,

  onFree: null,

  // This is an explicit statment that hands over control of a canvas
  freeCanvas: function(canvas, onFree) {
    if (this.onFree != null) {
      // Invoke the previous caller's right to know when the canvas is freed
      this.onFree();
    }
    // This is only legal is a canvas is not already free
    if (this._freedCanvas != null) {
      throw new Error('Attempted to free a canvas, when one has already been freed.')
    }

    this._freedCanvas = canvas;

    // Set up the onFree callback
    if (onFree != undefined) {
      this.onFree = onFree;
    } else {
      this.onFree = null;
    }
  },

  fetchFreedCanvas: function() {
    if (this._freedCanvas == null) {
      // Fetching a canvas that is not freed should be an error.
      throw new Error('Attempted to fetch a freed canvas, when there was none.')
    }
    return this._freedCanvas;
  },

  restrainCanvas: function() {
    if (this._freedCanvas == null) {
      // Fetching a canvas that is not freed should be an error.
      throw new Error('Attempted to restrain a freed canvas, when there was none.')

      this._freedCanvas = null;
    }
  }
};

export { CanvasControl };

/*
  The goal of this object is to communicate all of the input information in as
  little memory as possible (to cut down on server costs and etc...).

  Time for some math
  ALL numbers in javascript are 64 bit floating point numbers
  That means I get 52 integer bits to work with
  That means treating them like binary is pretty much impossible
  but I can try!

  I need to process the following information
  1 bit - UP key is pressed - 1's place
  1 bit - DOWN key is pressed - 2's place
  1 bit - LEFT key is pressed - 4's place
  1 bit - RIGHT key is pressed - 8's place
  1 bit - GAME PAUSED - 16's place
  1 bit - GAME RESUMED (no need to consolodate bits, I got so many) - 32's place

  000000 => I need to manipulate 6 of the integer bits... kinda

  TODO: PLEASE TEST THIS OMG
*/
class InputObject {
  constructor() {
    this.data = 0;
  }

  /*
    The functions for reading the data point
  */
  upKeyPressed() {
    return this.data%2;
  }
  downKeyPressed() {
    return Math.floor(this.data/2)%2;
  }
  leftKeyPressed() {
    return Math.floor(this.data/4)%2;
  }
  rightKeyPressed() {
    return Math.floor(this.data/8)%2;
  }
  gamePaused() {
    return Math.floor(this.data/16)%2;
  }
  gameResumed() {
    return Math.floor(this.data/32)%2;
  }

  // Set the bits
  setUpKey() {
    if (!this.upKeyPressed())
      this.data += 2*0+1;
  }
  setDownKey() {
    if (!this.downKeyPressed())
      this.data += 2*1+1;
  }
  setLeftKey() {
    if (!this.leftKeyPressed())
      this.data += 2*2+1;
  }
  setRightKey() {
    if (!this.rightKeyPressed())
      this.data += 2*3+1;
  }
  setPaused() {
    if (!this.gamePaused())
      this.data += 2*4+1;
  }
  setResumed() {
    if (!this.gameResumed())
      this.data += 2*5+1;
  }

  // Unset the bits
  // Set the bits
  unsetUpKey() {
    if (this.upKeyPressed())
      this.data -= 2*0+1;
  }
  unsetDownKey() {
    if (this.downKeyPressed())
      this.data -= 2*1+1;
  }
  unsetLeftKey() {
    if (this.leftKeyPressed())
      this.data -= 2*2+1;
  }
  unsetRightKey() {
    if (this.rightKeyPressed())
      this.data -= 2*3+1;
  }
  unsetPaused() {
    if (this.gamePaused())
      this.data -= 2*4+1;
  }
  unsetResumed() {
    if (this.gameResumed())
      this.data -= 2*5+1;
  }
}

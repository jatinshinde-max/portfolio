export default class MouseParallax {
  constructor(camera, maxAngle = 2) {
    this.camera   = camera;
    this.maxAngle = maxAngle;

    this.targetRotX  = 0;
    this.targetRotY  = 0;
    this.currentRotX = 0;
    this.currentRotY = 0;

    this._onMouseMove = this._onMouseMove.bind(this);
  }

  init() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  _onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth  - 0.5) * 2;
    const mouseY = (event.clientY / window.innerHeight - 0.5) * 2;

    this.targetRotY =  mouseX * (this.maxAngle       * Math.PI / 180);
    this.targetRotX = -mouseY * (this.maxAngle * 0.6 * Math.PI / 180);
  }

  // Call once per animation frame.
  update() {
    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.04;
    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.04;

    this.camera.rotation.x = this.currentRotX;
    this.camera.rotation.y = this.currentRotY;
  }

  destroy() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}

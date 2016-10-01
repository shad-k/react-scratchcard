import React, { Component } from 'react';

class ScratchCard extends Component {

  constructor(props) {
    super(props);
    this.state = { loaded: false }
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  componentDidMount() {

    this.isDrawing = false;
    this.lastPoint = null;
    this.ctx = this.canvas.getContext('2d');

    this.image = new Image();
    this.image.onload = () => {
      this.ctx.drawImage(this.image, 0, 0);
      this.setState({ loaded: true })
    }
    this.image.src = this.props.image;

    this.canvas.addEventListener('mousedown', this.handleMouseDown, false);
    this.canvas.addEventListener('touchstart', this.handleMouseDown, false);
    this.canvas.addEventListener('mousemove', this.handleMouseMove, false);
    this.canvas.addEventListener('touchmove', this.handleMouseMove, false);
    this.canvas.addEventListener('mouseup', this.handleMouseUp, false);
    this.canvas.addEventListener('touchend', this.handleMouseUp, false);
  }

  componentWillUnmount() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown, false);
    this.canvas.removeEventListener('touchstart', this.handleMouseDown, false);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove, false);
    this.canvas.removeEventListener('touchmove', this.handleMouseMove, false);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp, false);
    this.canvas.removeEventListener('touchend', this.handleMouseUp, false);
  }

  getFilledInPixels(stride) {
    if (!stride || stride < 1) {
      stride = 1;
    }

    const pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const total = pixels.data.length / stride;
    let count = 0;

    for (let i = 0; i < pixels.data.length; i += stride) {
      if (parseInt(pixels.data[i], 10) === 0) {
        count++;
      }
    }

    return Math.round((count / total) * 100);
  }

  getMouse(e, canvas) {
    let offsetX = 0;
    let offsetY = 0;
    let mx, my;

    if (canvas.offsetParent !== undefined) {
      do {
        offsetX += canvas.offsetLeft;
        offsetY += canvas.offsetTop;
      } while ((canvas = canvas.offsetParent));
    }

    mx = (e.pageX || e.touches[0].clientX) - offsetX;
    my = (e.pageY || e.touches[0].clientY) - offsetY;

    return { x: mx, y: my }
  }

  distanceBetween(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  handlePercentage(filledInPixels = 0) {
    if (filledInPixels > this.props.finishPercent) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.setState({ finished: true });
      if (this.props.onComplete) {
        this.props.onComplete();
      }
    }
  }

  handleMouseDown(e) {
    this.isDrawing = true;
    this.lastPoint = this.getMouse(e, this.canvas);
  }

  handleMouseMove(e) {
    if (!this.isDrawing) {
      return;
    }

    e.preventDefault();

    const currentPoint = this.getMouse(e, this.canvas);
    const distance = this.distanceBetween(this.lastPoint, currentPoint);
    const angle = this.angleBetween(this.lastPoint, currentPoint);

    let x, y;

    for (let i = 0; i < distance; i++) {
      x = this.lastPoint.x + (Math.sin(angle) * i) - 25;
      y = this.lastPoint.y + (Math.cos(angle) * i) - 25;
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillRect(x, y, 50, 50);
    }

    this.lastPoint = currentPoint;
    this.handlePercentage(this.getFilledInPixels(32));

  }

  handleMouseUp() {
    this.isDrawing = false;
  }

  render() {

    const containerStyle = {
      width: this.props.width + 'px',
      height: this.props.height + 'px',
      position: 'relative',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      userSelect: 'none'
    }

    const canvasStyle = {
      position: 'absolute',
      top: 0
    }

    const resultStyle = {
      visibility: this.state.loaded ? 'visible' : 'hidden'
    }

    return (
      <div className="ScratchCard__Container" style={containerStyle}>
        <canvas
          ref={(ref) => this.canvas = ref}
          className="ScratchCard__Canvas"
          style={canvasStyle}
          width={this.props.width}
          height={this.props.height}
        ></canvas>
        <div className="ScratchCard__Result" style={resultStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

ScratchCard.propTypes = {
  image: React.PropTypes.string.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  finishPercent: React.PropTypes.number.isRequired,
  onComplete: React.PropTypes.func
}

export default ScratchCard;
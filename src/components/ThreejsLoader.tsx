import React from 'react';
import ReactUILoader from './ReactUILoader';
import { logDebug } from '../utils/debug/logger';

interface Props {
  ViewGL: new (
    canvas: HTMLCanvasElement,
    container: HTMLDivElement,
    activeIndexes: number[]
  ) => any;
  onReady?: () => void;
}

export default class ThreejsLoader extends React.Component<Props> {
  private canvasRef: React.RefObject<HTMLCanvasElement | null>;
  private canvasContainer: React.RefObject<HTMLDivElement | null>;
  private viewGL: any;
  private arrayOfActiveIndexes: number[];

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    this.canvasContainer = React.createRef<HTMLDivElement>();
    this.arrayOfActiveIndexes = [];
    this.viewGL = null;
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const container = this.canvasContainer.current;

    if (!canvas || !container) {
      console.error('Canvas or container ref not found');
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (this.props.ViewGL) {
      this.viewGL = new this.props.ViewGL(
        canvas,
        container,
        this.arrayOfActiveIndexes
      );

      console.log('ViewGL initialised.');
    } else {
      console.error('No ViewGL class provided to ThreejsLoader.');
    }

    if (this.viewGL.ready) {
      this.viewGL.ready.then(() => {
        this.props.onReady?.();
      });
    }

    window.addEventListener('mousemove', this.mouseMove);
    window.addEventListener('click', this.mouseClick);
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate(_prevProps: any, _prevState: any) {
    logDebug('ThreejsLoader componentDidUpdate called with props:', this.props);
    
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.mouseMove);
    window.removeEventListener('click', this.mouseClick);
    window.removeEventListener('resize', this.handleResize);

    // Clean up Three.js resources
    if (this.viewGL && typeof this.viewGL.dispose === 'function') {
      this.viewGL.dispose();
    }
  }

  // ******************* EVENT LISTENERS ******************* //
  mouseMove = (event: MouseEvent) => {
    this.viewGL.onMouseMove(event);
  };

  mouseClick = (event: MouseEvent) => {
    this.viewGL.onMouseClick(event);
  };

  handleResize = () => {
    this.viewGL.onWindowResize(window.innerWidth, window.innerHeight);
  };

  render() {
    return (
      <div className='flexrelative'>
        <ReactUILoader />
        <div id='canvasContainer' ref={this.canvasContainer}>
          {/* <canvas id='threejs-app-canvas' className='max-w-[600px] max-h-[400px]' ref={this.canvasRef} /> */}
          <canvas
            id='threejs-app-canvas'
            className='w-full h-full'
            ref={this.canvasRef}
          />
        </div>
      </div>
    );
  }
}

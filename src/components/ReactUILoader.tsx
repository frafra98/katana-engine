import DisplayComponent from './threejs-ui/DisplayComponent.tsx';
import { WindowManager } from './threejs-ui/WindowManager.tsx';

const ReactUILoader = () => {
  return (
    <div>
      <WindowManager />      
      <DisplayComponent />
    </div>
  );
};

export default ReactUILoader;

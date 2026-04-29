import { useState } from 'react';
import './App.css';
import WelcomeScreen from './components/welcome-screen/WelcomeScreen';
import ThreejsLoader from './components/ThreejsLoader';
import { ThreejsMain } from './threejs/ThreejsMain';
import KELogo from './components/threejs-ui/ke-logo';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <>
      {/* Overlay */}
      {!hasStarted && (
        <WelcomeScreen
          isReady={isReady}
          onStart={() => setHasStarted(true)}
        />
      )}


      <KELogo />
      <ThreejsLoader ViewGL={ThreejsMain} onReady={() => setIsReady(true)} />

    </>
  );
}

export default App;

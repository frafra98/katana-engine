import { useCoinStore } from '../../stores/coinStore';

const DisplayComponent = () => {
  const coinCount = useCoinStore((state) => state.coinCount);

  return (
    <div id='coinCounter' className='fixed p-8'>
      <span className='text-amber-300'>Collected Coins:</span> {coinCount}
    </div>
  );
};

export default DisplayComponent;

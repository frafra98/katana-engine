import { useEffect, useState, type ReactNode } from 'react';
import BladeButton from './BladeButton';
import { hexToRgba } from '../base-components/ke-ui-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { adjustHex } from '../../../utils/ui-helper-functions';


interface FoldablePanelProps {
  children: ReactNode;
  name: string;

  isTitleCentred?: boolean;
  uiColour?: string;
  buttonsColour?: string;
  isOpen?: boolean;
}

const BladeFoldablePanel = ({
  children,
  isTitleCentred = false,
  name,
  uiColour = '#1e1e1e',
  buttonsColour = '#000000',
  isOpen = false,
}: FoldablePanelProps) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // This effect syncs isExpanded with isOpen whenever it changes
  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  return (
    <div
      data-nodrag
      key={name}
      className='p-4 rounded-lg shadow-md space-y-4 cursor-pointer'
      style={{
        backgroundColor: hexToRgba(uiColour, 0.5),
        borderWidth: '1px',
        borderColor: adjustHex(uiColour, 0.1),
      }}
      onClick={() => {
        if (!isExpanded) toggleExpand();
      }}
    >
      <div
        onClick={() => {
          toggleExpand();
        }}
        className='flex items-center justify-between cursor-pointer'
      >
        <div
          className={`flex justify-center items-center ${
            isTitleCentred ? 'w-full' : ''
          }`}
        >
          <h2 className='text-lg font-semibold mb-2 capitalize'>{name}</h2>
        </div>

        <BladeButton
          color={buttonsColour}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          className='text-gray-400 hover:text-white transition-colors'
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </BladeButton>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-max' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default BladeFoldablePanel;

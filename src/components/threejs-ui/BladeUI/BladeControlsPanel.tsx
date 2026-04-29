import type { UIControl } from '../../../types/UITypes';
import { ControlRenderer } from '../base-components/ke-control-renderer';

import BladeFoldablePanel from './BladeFoldablePanel';
import { WINDOW_DEFAULTS } from '../config/ui-config';

interface ControlsPanelProps {
  color: string;
  primaryColor: string;
  controls: UIControl[];
}

const ControlsPanel = ({
  color = WINDOW_DEFAULTS.secondaryColor,
  primaryColor = WINDOW_DEFAULTS.primaryColor,
  controls,
}: ControlsPanelProps) => {
  const grouped: any = {};

  // Group config entries by `group`
  Object.entries(controls).forEach(([key, item]: [string, UIControl]) => {
    // Skip if group is explicitly '_dev'
    if (item.group === '_dev') return;

    const groupName: string = item.group || 'default';

    if (!grouped[groupName]) {
      grouped[groupName] = [];
    }

    grouped[groupName].push({ key, config: item } as any);
  });

  // Render each group section
  return (
    <div className='flex flex-col overflow-y-auto w-full h-full p-4 gap-4'>
      {Object.entries(grouped).map(([groupName, entries] : any) => (
        <div key={groupName} className='shrink-0'>
          <BladeFoldablePanel
            name={groupName}
            uiColour={color}
            buttonsColour={primaryColor}
            isTitleCentred={false}
            isOpen={true}
          >
            <div className='flex flex-col overflow-y-auto w-full h-full p-2 gap-8'>
              {entries.map(({ key, config }: any) => (
                <ControlRenderer
                  key={key}
                  control={config}
                  color={primaryColor}
                />
              ))}
            </div>
          </BladeFoldablePanel>
        </div>
      ))}
    </div>
  );
};

export default ControlsPanel;

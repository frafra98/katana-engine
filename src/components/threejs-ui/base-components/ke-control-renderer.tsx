import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { useParamStore } from '../../../stores/paramsStore';
import type { UIControl } from '../../../types/UITypes';
import {
  KEColorInput,
  KESlider,
} from './ke-ui-components';


type Props = { control: UIControl; color?: string; };

export function ControlRenderer({ control, color }: Props) {
  const value = useParamStore((s) => s.params[control.param]?.value);
  const setParam = useParamStore((s) => s.setParam);

  const debouncedSetParam = useMemo(
    () =>
      debounce<(id: string, value: string | number | boolean) => void>(
        (id: string, value: string | number | boolean) => {
          // id.effect(value);
          setParam(id, value);
        },
        0
      ),
    [setParam]
  );

  useEffect((): (() => void) => {
    return () => {
      debouncedSetParam.cancel();
    };
  }, [debouncedSetParam]);

  const handleChange = useCallback(
    (id: string, value: string | number | boolean): void => {
      debouncedSetParam(id, value);
    },
    [debouncedSetParam]
  );

  if (control.type === 'slider') {
    return (
      <div>
        <label>
          {control.name}: {value}
        </label>
        <KESlider
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={Number(value ?? 0)}
          onChange={(e) => handleChange(control.param, Number(e))}
          color={color}
        />
      </div>
    );
  }

  if (control.type === 'color') {
    return (
      <KEColorInput
        id={control.name}
        label={control.name}
        value={String(value ?? '#ffffff')}
        onChange={(e) => handleChange(control.param, e.target.value)}
      />
    );
  }

  if (control.type === 'toggle') {
    return (
      <label>
        <input
          type='checkbox'
          checked={Boolean(value)}
          onChange={(e) => handleChange(control.param, e.target.checked)}
        />
        {control.param}
      </label>
    );
  }

  return null;
}

import * as React from 'react';

import ColorPicker from '../ColorPicker/ColorPicker';

export interface IPropertyPaneColorFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (color: string) => void;
}

function optionsWithCurrentValue(options: string[], value: string): string[] {
  const current = value?.trim();
  if (!current) {
    return options;
  }
  const exists = options.some((c) => c.toLowerCase() === current.toLowerCase());
  return exists ? options : [current, ...options];
}

const PropertyPaneColorField: React.FC<IPropertyPaneColorFieldProps> = ({
  label,
  value,
  options,
  onChange
}) => (
  <div style={{ marginBottom: '8px' }}>
    <ColorPicker
      label={label}
      value={value || options[0]}
      options={optionsWithCurrentValue(options, value)}
      shape="circle"
      onChange={onChange}
    />
  </div>
);

export default PropertyPaneColorField;

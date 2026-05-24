import * as React from 'react';

export interface IColorPickerProps {
  label: string;
  value: string;
  options: string[];
  shape?: 'circle' | 'square';
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<IColorPickerProps> = ({
  label,
  value,
  options,
  shape = 'square',
  onChange
}) => (
  <span style={{ display: 'block', marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
    <span style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`${label}: ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: color,
            borderRadius: shape === 'circle' ? '50%' : '4px',
            cursor: 'pointer',
            border: value === color ? '2px solid #0078d4' : '1px solid #ccc',
            padding: 0
          }}
        />
      ))}
    </span>
  </span>
);

export default ColorPicker;

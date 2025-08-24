import React, { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { useTheme } from '../../hooks/useTheme';

interface ColorPickerProps {
  fillColor: string;
  strokeColor: string;
  onFillColorChange: (color: string) => void;
  onStrokeColorChange: (color: string) => void;
}

type ColorType = 'fill' | 'stroke';

export function ColorPicker({ 
  fillColor, 
  strokeColor, 
  onFillColorChange, 
  onStrokeColorChange 
}: ColorPickerProps) {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState<ColorType | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const fillButtonRef = useRef<HTMLDivElement>(null);
  const strokeButtonRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && 
          !fillButtonRef.current?.contains(event.target as Node) &&
          !strokeButtonRef.current?.contains(event.target as Node)) {
        setShowPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const handleColorClick = (type: ColorType, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setPickerPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowPicker(showPicker === type ? null : type);
  };

  const handleColorChange = (color: { hex: string }) => {
    const hexColor = color.hex;
    if (showPicker === 'fill') {
      onFillColorChange(hexColor);
    } else if (showPicker === 'stroke') {
      onStrokeColorChange(hexColor);
    }
  };


  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 justify-center">
        <div
          ref={fillButtonRef}
          className="relative w-5 h-5 border rounded cursor-pointer transition-transform hover:scale-110"
          style={{ 
            backgroundColor: fillColor,
            borderColor: theme.colors.border.primary
          }}
          title={`Fill Color: ${fillColor}`}
          onClick={(e) => handleColorClick('fill', e)}
        />
        <div
          ref={strokeButtonRef}
          className="relative w-5 h-5 bg-transparent border-2 rounded cursor-pointer transition-transform hover:scale-110"
          style={{ borderColor: strokeColor }}
          title={`Stroke Color: ${strokeColor}`}
          onClick={(e) => handleColorClick('stroke', e)}
        />
      </div>


      {showPicker && (
        <div className="fixed z-[100]" style={{ 
          left: pickerPosition.x, 
          top: pickerPosition.y,
          transform: pickerPosition.x > window.innerWidth - 300 
            ? 'translateX(-100%)' 
            : 'none'
        }}>
          <div className="p-2 rounded-lg shadow-2xl border" style={{
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.primary
          }}>
            <SketchPicker
              color={showPicker === 'fill' ? fillColor : strokeColor}
              onChange={handleColorChange}
              disableAlpha={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
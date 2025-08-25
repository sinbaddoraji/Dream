import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    const handleResize = () => {
      if (showPicker) {
        // Reposition picker on window resize to keep it visible
        const buttonRef = showPicker === 'fill' ? fillButtonRef : strokeButtonRef;
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const pickerWidth = 300;
          const pickerHeight = 320;
          const padding = 10;
          
          let x = rect.right + padding;
          let y = rect.top;
          
          if (x + pickerWidth > window.innerWidth) {
            x = rect.left - pickerWidth - padding;
          }
          if (x < 0) x = padding;
          
          if (y + pickerHeight > window.innerHeight) {
            y = rect.top - pickerHeight - padding;
          }
          if (y < 0) y = padding;
          
          setPickerPosition({ x, y });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [showPicker]);

  const handleColorClick = (type: ColorType, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pickerWidth = 300; // Approximate width of SketchPicker
    const pickerHeight = 320; // Approximate height of SketchPicker
    const padding = 10;
    
    // Calculate initial position (prefer right side)
    let x = rect.right + padding;
    let y = rect.top;
    
    // Check if picker would overflow right edge
    if (x + pickerWidth > window.innerWidth) {
      // Position to the left of the button instead
      x = rect.left - pickerWidth - padding;
    }
    
    // If still overflows (very narrow screen), clamp to screen edge
    if (x < 0) {
      x = padding;
    }
    
    // Check vertical overflow
    if (y + pickerHeight > window.innerHeight) {
      // Position above the button
      y = rect.top - pickerHeight - padding;
    }
    
    // If still overflows top, clamp to top of screen
    if (y < 0) {
      y = padding;
    }
    
    setPickerPosition({ x, y });
    setShowPicker(showPicker === type ? null : type);
  };

  const handleColorChange = (color: { hex: string; rgb: { r: number; g: number; b: number; a?: number } }) => {
    // Use RGBA if alpha is present and less than 1, otherwise use hex
    const rgbaColor = color.rgb.a !== undefined && color.rgb.a < 1
      ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
      : color.hex;
      
    if (showPicker === 'fill') {
      onFillColorChange(rgbaColor);
    } else if (showPicker === 'stroke') {
      onStrokeColorChange(rgbaColor);
    }
  };


  const isTransparent = useCallback((color: string) => {
    if (color === 'transparent') return true;
    if (color.startsWith('rgba')) {
      // Extract alpha value from rgba(r,g,b,a) format
      const match = color.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
      if (match && parseFloat(match[1]) === 0) return true;
    }
    return false;
  }, []);

  const [lastSolidColor, setLastSolidColor] = useState('#ffffff');

  // Update last solid color when a non-transparent color is selected
  React.useEffect(() => {
    if (!isTransparent(fillColor)) {
      setLastSolidColor(fillColor);
    }
  }, [fillColor, isTransparent]);

  return (
    <div className="space-y-2">
      {/* Fill toggle buttons */}
      <div className="flex justify-center gap-1">
        <button
          onClick={() => onFillColorChange('transparent')}
          className={`px-2 py-1 text-xs rounded border transition-colors ${
            isTransparent(fillColor) 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={!isTransparent(fillColor) ? { 
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.secondary
          } : {}}
          title="Set fill to transparent"
        >
          No Fill
        </button>
        <button
          onClick={() => onFillColorChange(lastSolidColor)}
          className={`px-2 py-1 text-xs rounded border transition-colors relative ${
            !isTransparent(fillColor) 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'hover:bg-gray-100'
          }`}
          style={isTransparent(fillColor) ? { 
            borderColor: theme.colors.border.primary,
            color: theme.colors.text.secondary
          } : {}}
          title={`Enable fill color: ${lastSolidColor}`}
        >
          <span>Fill</span>
          {isTransparent(fillColor) && (
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 border rounded-full"
              style={{ 
                backgroundColor: lastSolidColor,
                borderColor: theme.colors.border.primary
              }}
              title={`Will set fill to: ${lastSolidColor}`}
            />
          )}
        </button>
      </div>
      
      <div className="flex items-center gap-2 justify-center">
        <div
          ref={fillButtonRef}
          className="relative w-5 h-5 border rounded cursor-pointer transition-transform hover:scale-110"
          style={{ 
            backgroundColor: isTransparent(fillColor) ? 'transparent' : fillColor,
            borderColor: theme.colors.border.primary,
            backgroundImage: isTransparent(fillColor) 
              ? 'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)'
              : 'none',
            backgroundSize: isTransparent(fillColor) ? '6px 6px' : 'auto',
            backgroundPosition: isTransparent(fillColor) ? '0 0, 0 3px, 3px -3px, -3px 0px' : 'auto'
          }}
          title={`Fill Color: ${fillColor}`}
          onClick={(e) => handleColorClick('fill', e)}
        >
          {isTransparent(fillColor) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-red-500">∅</span>
            </div>
          )}
        </div>
        <div
          ref={strokeButtonRef}
          className="relative w-5 h-5 bg-transparent border-2 rounded cursor-pointer transition-transform hover:scale-110"
          style={{ borderColor: strokeColor }}
          title={`Stroke Color: ${strokeColor}`}
          onClick={(e) => handleColorClick('stroke', e)}
        />
      </div>


      {showPicker && (
        <div 
          className="fixed z-[100]" 
          style={{ 
            left: pickerPosition.x, 
            top: pickerPosition.y
          }}
        >
          <div 
            className="p-2 rounded-lg shadow-2xl border max-h-[90vh] overflow-auto" 
            style={{
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.primary
            }}
          >
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
import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';

export function ToolOptions() {
  const { activeTool, strokeWidth, setStrokeWidth } = useDesignStore();
  const { theme } = useTheme();

  const getToolOptions = () => {
    switch (activeTool) {
      case 'pen':
      case 'brush':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="1"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'eraser':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="5"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'rectangle':
      case 'ellipse':
      case 'triangle':
      case 'star':
      case 'hexagon':
      case 'pentagon':
      case 'octagon':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Width
              </span>
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'line':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Width
              </span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-4" style={{ color: theme.colors.text.secondary }}>
                {strokeWidth}
              </span>
            </div>
          </div>
        );

      case 'text': {
        const { 
          fontSize, fontFamily, fontWeight, fontStyle, textDecoration, textAlign, lineHeight, letterSpacing,
          textShadowBlur, textShadowOffsetX, textShadowOffsetY, textShadowOpacity,
          setFontSize, setFontFamily, setFontWeight, setFontStyle, setTextDecoration, setTextAlign, 
          setLineHeight, setLetterSpacing, setTextShadowBlur, setTextShadowOffsetX, setTextShadowOffsetY, setTextShadowOpacity
        } = useDesignStore.getState();
        
        return (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Font Family */}
            <div className="space-y-1">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Font Family
              </span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full text-[10px] p-1 rounded border"
                style={{
                  backgroundColor: theme.colors.surface.secondary,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }}
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Palatino">Palatino</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Source Sans Pro">Source Sans Pro</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Size
              </span>
              <input
                type="range"
                min="6"
                max="200"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-8" style={{ color: theme.colors.text.secondary }}>
                {fontSize}px
              </span>
            </div>

            {/* Font Weight */}
            <div className="space-y-1">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Weight
              </span>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full text-[10px] p-1 rounded border"
                style={{
                  backgroundColor: theme.colors.surface.secondary,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border.primary
                }}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Lighter</option>
                <option value="bolder">Bolder</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>

            {/* Font Style & Decoration */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                  Style
                </span>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                  className="w-full text-[10px] p-1 rounded border"
                  style={{
                    backgroundColor: theme.colors.surface.secondary,
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.border.primary
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                  Decoration
                </span>
                <select
                  value={textDecoration}
                  onChange={(e) => setTextDecoration(e.target.value)}
                  className="w-full text-[10px] p-1 rounded border"
                  style={{
                    backgroundColor: theme.colors.surface.secondary,
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.border.primary
                  }}
                >
                  <option value="">None</option>
                  <option value="underline">Underline</option>
                  <option value="line-through">Line Through</option>
                  <option value="underline line-through">Both</option>
                </select>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Alignment
              </span>
              <div className="grid grid-cols-4 gap-1">
                {['left', 'center', 'right', 'justify'].map((align) => (
                  <button
                    key={align}
                    onClick={() => setTextAlign(align)}
                    className={`px-2 py-1 text-[10px] rounded border ${
                      textAlign === align ? 'opacity-100' : 'opacity-60'
                    }`}
                    style={{
                      backgroundColor: textAlign === align ? theme.colors.interactive.primary : theme.colors.surface.secondary,
                      color: textAlign === align ? theme.colors.text.inverse : theme.colors.text.primary,
                      borderColor: theme.colors.border.primary
                    }}
                  >
                    {align.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Line Height
              </span>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-6" style={{ color: theme.colors.text.secondary }}>
                {lineHeight}
              </span>
            </div>

            {/* Letter Spacing */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Spacing
              </span>
              <input
                type="range"
                min="-5"
                max="20"
                step="0.5"
                value={letterSpacing}
                onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                className="flex-1 h-1"
              />
              <span className="text-[10px] w-6" style={{ color: theme.colors.text.secondary }}>
                {letterSpacing}px
              </span>
            </div>

            {/* Text Shadow */}
            <div className="space-y-2">
              <span className="text-[10px]" style={{ color: theme.colors.text.secondary }}>
                Text Shadow
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[9px]" style={{ color: theme.colors.text.secondary }}>Blur</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={textShadowBlur}
                    onChange={(e) => setTextShadowBlur(parseInt(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-[9px] w-4" style={{ color: theme.colors.text.secondary }}>
                    {textShadowBlur}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[9px]" style={{ color: theme.colors.text.secondary }}>Opacity</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textShadowOpacity}
                    onChange={(e) => setTextShadowOpacity(parseFloat(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-[9px] w-4" style={{ color: theme.colors.text.secondary }}>
                    {Math.round(textShadowOpacity * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[9px]" style={{ color: theme.colors.text.secondary }}>X</span>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={textShadowOffsetX}
                    onChange={(e) => setTextShadowOffsetX(parseInt(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-[9px] w-4" style={{ color: theme.colors.text.secondary }}>
                    {textShadowOffsetX}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[9px]" style={{ color: theme.colors.text.secondary }}>Y</span>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={textShadowOffsetY}
                    onChange={(e) => setTextShadowOffsetY(parseInt(e.target.value))}
                    className="flex-1 h-1"
                  />
                  <span className="text-[9px] w-4" style={{ color: theme.colors.text.secondary }}>
                    {textShadowOffsetY}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const toolOptions = getToolOptions();

  if (!toolOptions) return null;

  return (
    <div className="border-t pt-2 mt-2" style={{ borderColor: theme.colors.border.primary }}>
      {toolOptions}
    </div>
  );
}
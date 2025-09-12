import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useDesignStore } from '../../store/designStore';

interface TextEditorProps {
  textNode: any; // Konva Text node
  initialText?: string;
  onChange: (text: string) => void;
  onClose: () => void;
  onConfirm?: () => void;
}

export function TextEditor({ textNode, initialText = '', onChange, onClose, onConfirm }: TextEditorProps) {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initialText);
  
  const {
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textAlign,
    lineHeight,
    letterSpacing,
    fillColor
  } = useDesignStore();

  useEffect(() => {
    if (!textareaRef.current || !textNode) return;

    const textarea = textareaRef.current;
    const textPosition = textNode.absolutePosition();
    const stage = textNode.getStage();
    const stageBox = stage.container().getBoundingClientRect();

    // Position the textarea exactly over the text node
    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    // Style the textarea to match the text node
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = Math.max(textNode.width() - textNode.padding() * 2, 100) + 'px';
    textarea.style.fontSize = fontSize + 'px';
    textarea.style.fontFamily = fontFamily;
    textarea.style.fontWeight = fontWeight;
    textarea.style.fontStyle = fontStyle;
    textarea.style.textAlign = textAlign;
    textarea.style.lineHeight = lineHeight.toString();
    textarea.style.letterSpacing = letterSpacing + 'px';
    textarea.style.color = fillColor;
    textarea.style.border = '2px solid #0066ff';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.background = 'rgba(255, 255, 255, 0.95)';
    textarea.style.backdropFilter = 'blur(8px)';
    textarea.style.zIndex = '10000';
    
    // Handle rotation
    const rotation = textNode.rotation();
    if (rotation) {
      textarea.style.transform = `rotateZ(${rotation}deg)`;
      textarea.style.transformOrigin = 'left top';
    }

    // Auto-resize height
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight + 6, fontSize + 12) + 'px';
    };

    adjustHeight();
    textarea.focus();
    textarea.select();

    // Add resize handler
    textarea.addEventListener('input', adjustHeight);
    
    return () => {
      textarea.removeEventListener('input', adjustHeight);
    };
  }, [textNode, fontSize, fontFamily, fontWeight, fontStyle, textAlign, lineHeight, letterSpacing, fillColor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleConfirm = () => {
    onChange(text);
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only close if not clicking on a related UI element
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('[data-text-editor-ui]')) {
      handleConfirm();
    }
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter text..."
        spellCheck={false}
        data-text-editor-ui
      />
      
      {/* Editing controls */}
      <div 
        data-text-editor-ui
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 z-[10001]"
        style={{
          backgroundColor: theme.colors.surface.primary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <span style={{ color: theme.colors.text.secondary }}>
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to confirm, 
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">Esc</kbd> to cancel,
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs ml-1">Shift+Enter</kbd> for new line
          </span>
          <div className="flex gap-1 ml-2">
            <button
              onClick={handleConfirm}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              data-text-editor-ui
            >
              ✓
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
              data-text-editor-ui
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
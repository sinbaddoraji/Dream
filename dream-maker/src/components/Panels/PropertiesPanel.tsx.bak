import { useState, useEffect } from 'react';
import { 
  Move, 
  RotateCcw, 
  Square, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Layers,
  Hash
} from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';

interface PropertiesPanelProps {
  compact?: boolean;
}

export function PropertiesPanel({ compact = false }: PropertiesPanelProps) {
  const { theme } = useTheme();
  const {
    getSelectedObjects,
    updateObject,
    lockObjects,
    unlockObjects,
    hideObjects,
    showObjects
  } = useDesignStore();

  const selectedObjects = getSelectedObjects();
  const hasSelection = selectedObjects.length > 0;
  const singleSelection = selectedObjects.length === 1;
  
  // Local state for property editing
  const [localProperties, setLocalProperties] = useState({
    name: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1
  });

  // Update local properties when selection changes
  useEffect(() => {
    if (singleSelection) {
      const obj = selectedObjects[0];
      const bounds = obj.paperItem.bounds;
      
      setLocalProperties({
        name: obj.name || 'Unnamed',
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        rotation: Math.round(obj.paperItem.rotation || 0),
        opacity: obj.paperItem.opacity || 1
      });
    } else if (hasSelection) {
      // Multiple selection - show aggregate info
      setLocalProperties({
        name: `${selectedObjects.length} items`,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1
      });
    }
  }, [selectedObjects, singleSelection, hasSelection]);

  // Handle property changes
  const handlePropertyChange = (property: string, value: string | number) => {
    if (!singleSelection) return;
    
    const obj = selectedObjects[0];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    switch (property) {
      case 'name':
        updateObject(obj.id, { name: value as string });
        break;
      case 'x':
        if (!isNaN(numValue)) {
          obj.paperItem.bounds.x = numValue;
        }
        break;
      case 'y':
        if (!isNaN(numValue)) {
          obj.paperItem.bounds.y = numValue;
        }
        break;
      case 'width':
        if (!isNaN(numValue) && numValue > 0) {
          obj.paperItem.bounds.width = numValue;
        }
        break;
      case 'height':
        if (!isNaN(numValue) && numValue > 0) {
          obj.paperItem.bounds.height = numValue;
        }
        break;
      case 'rotation':
        if (!isNaN(numValue)) {
          obj.paperItem.rotation = numValue;
        }
        break;
      case 'opacity':
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
          obj.paperItem.opacity = numValue;
        }
        break;
    }
    
    setLocalProperties(prev => ({ ...prev, [property]: value }));
  };

  const toggleLock = () => {
    if (!hasSelection) return;
    
    const hasLocked = selectedObjects.some(obj => obj.locked);
    const ids = selectedObjects.map(obj => obj.id);
    
    if (hasLocked) {
      unlockObjects(ids);
    } else {
      lockObjects(ids);
    }
  };

  const toggleVisibility = () => {
    if (!hasSelection) return;
    
    const hasHidden = selectedObjects.some(obj => !obj.visible);
    const ids = selectedObjects.map(obj => obj.id);
    
    if (hasHidden) {
      showObjects(ids);
    } else {
      hideObjects(ids);
    }
  };

  if (!hasSelection) {
    return (
      <div 
        className={`${compact ? 'w-full' : 'w-64 h-full border-l'} p-3`}
        style={{
          backgroundColor: compact ? 'transparent' : theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
        }}
      >
        <div className={`text-center ${compact ? 'py-4' : 'py-8'}`}>
          <Square 
            size={compact ? 24 : 48} 
            className="mx-auto mb-2 opacity-50"
            style={{ color: theme.colors.text.secondary }}
          />
          <p 
            className={`text-xs opacity-75 ${compact ? 'leading-tight' : ''}`}
            style={{ color: theme.colors.text.secondary }}
          >
            {compact ? 'Select to edit' : 'Select an object to view properties'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${compact ? 'w-full' : 'w-64 h-full border-l'} p-3 overflow-y-auto`}
      style={{
        backgroundColor: compact ? 'transparent' : theme.colors.background.secondary,
        borderColor: theme.colors.border.primary,
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 
            className="font-medium text-sm"
            style={{ color: theme.colors.text.primary }}
          >
            Properties
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={toggleVisibility}
              className="p-1 rounded hover:bg-gray-200"
              title={selectedObjects.some(obj => !obj.visible) ? 'Show' : 'Hide'}
            >
              {selectedObjects.some(obj => !obj.visible) ? (
                <EyeOff size={16} style={{ color: theme.colors.text.secondary }} />
              ) : (
                <Eye size={16} style={{ color: theme.colors.text.secondary }} />
              )}
            </button>
            <button
              onClick={toggleLock}
              className="p-1 rounded hover:bg-gray-200"
              title={selectedObjects.some(obj => obj.locked) ? 'Unlock' : 'Lock'}
            >
              {selectedObjects.some(obj => obj.locked) ? (
                <Unlock size={16} style={{ color: theme.colors.text.secondary }} />
              ) : (
                <Lock size={16} style={{ color: theme.colors.text.secondary }} />
              )}
            </button>
          </div>
        </div>

        {/* Selection Info */}
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: theme.colors.background.primary }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Layers size={16} style={{ color: theme.colors.text.secondary }} />
            <span 
              className="text-sm font-medium"
              style={{ color: theme.colors.text.primary }}
            >
              {singleSelection ? selectedObjects[0].type : 'Multiple Selection'}
            </span>
          </div>
          
          {singleSelection && (
            <input
              type="text"
              value={localProperties.name}
              onChange={(e) => handlePropertyChange('name', e.target.value)}
              className="w-full px-2 py-1 text-xs border rounded"
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.secondary,
                color: theme.colors.text.primary,
              }}
              placeholder="Object name"
            />
          )}
        </div>

        {/* Transform Properties */}
        {singleSelection && (
          <div 
            className="p-3 rounded-lg space-y-3"
            style={{ backgroundColor: theme.colors.background.primary }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <Move size={16} style={{ color: theme.colors.text.secondary }} />
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                Transform
              </span>
            </div>

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label 
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.text.secondary }}
                >
                  X
                </label>
                <input
                  type="number"
                  value={localProperties.x}
                  onChange={(e) => handlePropertyChange('x', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: theme.colors.border.secondary,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>
              <div>
                <label 
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Y
                </label>
                <input
                  type="number"
                  value={localProperties.y}
                  onChange={(e) => handlePropertyChange('y', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: theme.colors.border.secondary,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label 
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Width
                </label>
                <input
                  type="number"
                  value={localProperties.width}
                  onChange={(e) => handlePropertyChange('width', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: theme.colors.border.secondary,
                    color: theme.colors.text.primary,
                  }}
                  min="1"
                />
              </div>
              <div>
                <label 
                  className="text-xs mb-1 block"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Height
                </label>
                <input
                  type="number"
                  value={localProperties.height}
                  onChange={(e) => handlePropertyChange('height', e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded"
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    borderColor: theme.colors.border.secondary,
                    color: theme.colors.text.primary,
                  }}
                  min="1"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label 
                className="text-xs mb-1 flex items-center space-x-1"
                style={{ color: theme.colors.text.secondary }}
              >
                <RotateCcw size={12} />
                <span>Rotation</span>
              </label>
              <input
                type="number"
                value={localProperties.rotation}
                onChange={(e) => handlePropertyChange('rotation', e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.secondary,
                  color: theme.colors.text.primary,
                }}
                min="-360"
                max="360"
                step="1"
              />
            </div>

            {/* Opacity */}
            <div>
              <label 
                className="text-xs mb-1 block"
                style={{ color: theme.colors.text.secondary }}
              >
                Opacity
              </label>
              <input
                type="range"
                value={localProperties.opacity}
                onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="1"
                step="0.1"
              />
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: theme.colors.text.secondary }}>0%</span>
                <span style={{ color: theme.colors.text.secondary }}>
                  {Math.round(localProperties.opacity * 100)}%
                </span>
                <span style={{ color: theme.colors.text.secondary }}>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-selection info */}
        {!singleSelection && (
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.background.primary }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Hash size={16} style={{ color: theme.colors.text.secondary }} />
              <span 
                className="text-sm font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                Selection Summary
              </span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div 
                className="flex justify-between"
                style={{ color: theme.colors.text.secondary }}
              >
                <span>Total items:</span>
                <span>{selectedObjects.length}</span>
              </div>
              <div 
                className="flex justify-between"
                style={{ color: theme.colors.text.secondary }}
              >
                <span>Locked:</span>
                <span>{selectedObjects.filter(obj => obj.locked).length}</span>
              </div>
              <div 
                className="flex justify-between"
                style={{ color: theme.colors.text.secondary }}
              >
                <span>Hidden:</span>
                <span>{selectedObjects.filter(obj => !obj.visible).length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
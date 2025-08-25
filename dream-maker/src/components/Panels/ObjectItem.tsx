import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Minus, 
  Folder, 
  FolderOpen,
  MoreVertical,
  Edit2,
  Copy,
  Trash2
} from 'lucide-react';
import { useDesignStore, type CanvasObject } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';

interface ObjectItemProps {
  object: CanvasObject;
  isSelected: boolean;
  isGroup?: boolean;
  onClick: (event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export function ObjectItem({ object, isSelected, isGroup = false, onClick, onContextMenu }: ObjectItemProps) {
  const { theme } = useTheme();
  const { 
    updateObject, 
    lockObjects, 
    unlockObjects, 
    hideObjects, 
    showObjects,
    duplicateObjects,
    deleteObjects,
    ungroupObjects
  } = useDesignStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(object.name || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const getObjectIcon = () => {
    if (isGroup) return object.visible ? <FolderOpen size={14} /> : <Folder size={14} />;
    
    switch (object.type) {
      case 'shape':
        return <Square size={14} />;
      case 'text':
        return <Type size={14} />;
      case 'path':
        return <Minus size={14} />;
      case 'image':
        return <ImageIcon size={14} />;
      default:
        return <Square size={14} />;
    }
  };

  const getObjectDisplayName = () => {
    if (object.name) return object.name;
    
    // Generate friendly names based on object type
    switch (object.type) {
      case 'shape':
        return 'Shape';
      case 'text':
        return 'Text';
      case 'path':
        return 'Path';
      case 'image':
        return 'Image';
      case 'group':
        return 'Group';
      default:
        return 'Object';
    }
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (object.visible) {
      hideObjects([object.id]);
    } else {
      showObjects([object.id]);
    }
  };

  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (object.locked) {
      unlockObjects([object.id]);
    } else {
      lockObjects([object.id]);
    }
  };

  const handleNameEdit = () => {
    setIsEditing(true);
    setEditName(object.name || getObjectDisplayName());
    setShowDropdown(false);
  };

  const handleNameSave = () => {
    if (editName.trim()) {
      updateObject(object.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditName(object.name || '');
    setIsEditing(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateObjects([object.id]);
    setShowDropdown(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      ungroupObjects(object.id);
    } else {
      deleteObjects([object.id]);
    }
    setShowDropdown(false);
  };

  const dropdownItems = [
    { icon: Edit2, label: 'Rename', action: handleNameEdit },
    { icon: Copy, label: 'Duplicate', action: handleDuplicate },
    { icon: Trash2, label: isGroup ? 'Ungroup' : 'Delete', action: handleDelete, destructive: true },
  ];

  return (
    <div
      className={`group flex items-center justify-between px-2 py-1.5 mx-2 rounded cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-100 border border-blue-300' 
          : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        backgroundColor: isSelected 
          ? theme.colors.accent?.light || 'rgb(219 234 254)'
          : undefined
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Object Icon */}
        <div style={{ color: theme.colors.text.secondary }}>
          {getObjectIcon()}
        </div>

        {/* Object Name */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSave();
              if (e.key === 'Escape') handleNameCancel();
            }}
            autoFocus
            className="flex-1 text-sm px-1 py-0 border rounded"
            style={{
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.primary
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="text-sm truncate flex-1"
            style={{ color: theme.colors.text.primary }}
          >
            {getObjectDisplayName()}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Visibility Toggle */}
        <button
          onClick={handleVisibilityToggle}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
          title={object.visible ? 'Hide object' : 'Show object'}
        >
          {object.visible ? (
            <Eye size={12} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <EyeOff size={12} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* Lock Toggle */}
        <button
          onClick={handleLockToggle}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
          title={object.locked ? 'Unlock object' : 'Lock object'}
        >
          {object.locked ? (
            <Lock size={12} style={{ color: theme.colors.text.secondary }} />
          ) : (
            <Unlock size={12} style={{ color: theme.colors.text.secondary }} />
          )}
        </button>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
            title="More options"
          >
            <MoreVertical size={12} style={{ color: theme.colors.text.secondary }} />
          </button>

          {showDropdown && (
            <>
              <div
                className="absolute right-0 top-full mt-1 z-50 bg-white rounded-md shadow-lg py-1 min-w-[120px]"
                style={{
                  backgroundColor: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.primary}`
                }}
              >
                {dropdownItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                      item.destructive ? 'text-red-600 hover:bg-red-50' : ''
                    }`}
                    style={{ 
                      color: item.destructive ? '#dc2626' : theme.colors.text.primary 
                    }}
                  >
                    <item.icon size={12} />
                    {item.label}
                  </button>
                ))}
              </div>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
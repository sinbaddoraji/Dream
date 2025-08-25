import React from 'react';
import {
  Group,
  Ungroup,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown
} from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { theme } = useTheme();
  const {
    selection,
    groups,
    getSelectedObjects,
    createGroup,
    ungroupObjects,
    duplicateObjects,
    deleteObjects,
    lockObjects,
    unlockObjects,
    hideObjects,
    showObjects,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useDesignStore();

  const selectedObjects = getSelectedObjects();
  const hasSelection = selectedObjects.length > 0;
  const canGroup = selectedObjects.length > 1;
  const hasLocked = selectedObjects.some(obj => obj.locked);
  const hasHidden = selectedObjects.some(obj => !obj.visible);

  // Check if any selected objects are part of a group that can be ungrouped
  const canUngroup = selectedObjects.some(obj => {
    if (obj.parentGroup) {
      const group = groups[obj.parentGroup];
      return group && group.objectIds.length > 1;
    }
    return false;
  });

  const menuItems = [
    {
      label: 'Copy',
      icon: Copy,
      action: () => {
        duplicateObjects(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+C'
    },
    { type: 'divider' },
    {
      label: 'Group',
      icon: Group,
      action: () => {
        createGroup();
        onClose();
      },
      disabled: !canGroup,
      shortcut: 'Ctrl+G'
    },
    {
      label: 'Ungroup',
      icon: Ungroup,
      action: () => {
        selectedObjects.forEach(obj => {
          if (obj.parentGroup) {
            ungroupObjects(obj.parentGroup);
          }
        });
        onClose();
      },
      disabled: !canUngroup,
      shortcut: 'Ctrl+Shift+G'
    },
    { type: 'divider' },
    {
      label: hasLocked ? 'Unlock' : 'Lock',
      icon: hasLocked ? Unlock : Lock,
      action: () => {
        if (hasLocked) {
          unlockObjects(selection.selectedIds);
        } else {
          lockObjects(selection.selectedIds);
        }
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+L'
    },
    {
      label: hasHidden ? 'Show' : 'Hide',
      icon: hasHidden ? Eye : EyeOff,
      action: () => {
        if (hasHidden) {
          showObjects(selection.selectedIds);
        } else {
          hideObjects(selection.selectedIds);
        }
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+H'
    },
    { type: 'divider' },
    {
      label: 'Bring to Front',
      icon: ChevronsUp,
      action: () => {
        bringToFront(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+Shift+]'
    },
    {
      label: 'Bring Forward',
      icon: ChevronUp,
      action: () => {
        bringForward(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+]'
    },
    {
      label: 'Send Backward',
      icon: ChevronDown,
      action: () => {
        sendBackward(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+['
    },
    {
      label: 'Send to Back',
      icon: ChevronsDown,
      action: () => {
        sendToBack(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Ctrl+Shift+['
    },
    { type: 'divider' },
    {
      label: 'Delete',
      icon: Trash2,
      action: () => {
        deleteObjects(selection.selectedIds);
        onClose();
      },
      disabled: !hasSelection,
      shortcut: 'Delete',
      danger: true
    }
  ];

  const handleItemClick = (item: { disabled?: boolean; action?: () => void }) => {
    if (!item.disabled && item.action) {
      item.action();
    }
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 min-w-48 py-1 shadow-lg border rounded-md"
      style={{
        left: x,
        top: y,
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.border.primary,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'divider') {
          return (
            <div
              key={index}
              className="h-px my-1 mx-2"
              style={{ backgroundColor: theme.colors.border.secondary }}
            />
          );
        }

        const Icon = item.icon;
        return (
          <button
            key={index}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
              item.danger ? 'text-red-600' : ''
            }`}
            style={{
              backgroundColor: 'transparent',
              color: item.danger ? '#dc2626' : theme.colors.text.primary,
            }}
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center space-x-2">
              {Icon && <Icon size={16} />}
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span
                className="text-xs opacity-60"
                style={{ color: theme.colors.text.secondary }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
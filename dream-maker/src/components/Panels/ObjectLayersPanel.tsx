import { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { useDesignStore } from '../../store/designStore';
import { useTheme } from '../../hooks/useTheme';
import { ObjectItem } from './ObjectItem';

export function ObjectLayersPanel() {
  const { theme } = useTheme();
  const { 
    objects, 
    groups, 
    selection,
    selectObjects,
    addToSelection,
    removeFromSelection,
    clearSelection,
    createGroup,
    deleteObjects
  } = useDesignStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; objectId?: string } | null>(null);

  // Get all objects sorted by creation order (reverse for layers-like display)
  const allObjects = Object.values(objects).reverse();
  
  // Filter objects based on search query
  const filteredObjects = allObjects.filter(obj => 
    (obj.name || obj.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group objects by their parent groups
  const groupedObjects = filteredObjects.reduce((acc, obj) => {
    if (obj.parentGroup) {
      if (!acc.groups[obj.parentGroup]) {
        acc.groups[obj.parentGroup] = [];
      }
      acc.groups[obj.parentGroup].push(obj);
    } else {
      acc.ungrouped.push(obj);
    }
    return acc;
  }, { ungrouped: [] as typeof allObjects, groups: {} as Record<string, typeof allObjects> });

  const handleObjectClick = (objectId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (selection.selectedIds.includes(objectId)) {
        removeFromSelection([objectId]);
      } else {
        addToSelection([objectId]);
      }
    } else {
      // Single select
      selectObjects([objectId]);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, objectId?: string) => {
    event.preventDefault();
    setShowContextMenu({ x: event.clientX, y: event.clientY, objectId });
  };

  const handleCreateGroup = () => {
    const groupId = createGroup('New Group');
    if (groupId) {
      clearSelection();
      setShowContextMenu(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selection.selectedIds.length > 0) {
      deleteObjects(selection.selectedIds);
    }
    setShowContextMenu(null);
  };

  const contextMenuItems = [
    { label: 'Group Selected', action: handleCreateGroup, disabled: selection.selectedIds.length < 2 },
    { label: 'Delete Selected', action: handleDeleteSelected, disabled: selection.selectedIds.length === 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: theme.colors.border.primary }}>
        <div className="relative">
          <Search 
            size={14} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            style={{ color: theme.colors.text.secondary }}
          />
          <input
            type="text"
            placeholder="Search objects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-sm rounded border"
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.primary
            }}
          />
        </div>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto">
        {filteredObjects.length === 0 ? (
          <div className="p-8 text-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
              style={{ backgroundColor: theme.colors.background.secondary }}
            >
              <Plus size={24} style={{ color: theme.colors.text.secondary }} />
            </div>
            <p className="text-sm mb-2" style={{ color: theme.colors.text.primary }}>
              No objects yet
            </p>
            <p className="text-xs leading-relaxed" style={{ color: theme.colors.text.secondary }}>
              Start drawing to see objects appear here
            </p>
          </div>
        ) : (
          <div 
            className="py-2"
            onContextMenu={(e) => handleContextMenu(e)}
          >
            {/* Render groups first */}
            {Object.entries(groups).map(([groupId, group]) => {
              const groupObjects = groupedObjects.groups[groupId] || [];
              return (
                <div key={groupId} className="mb-2">
                  <ObjectItem
                    object={{
                      id: groupId,
                      type: 'group',
                      name: group.name,
                      locked: group.locked,
                      visible: group.visible
                    } as any}
                    isSelected={selection.selectedIds.includes(groupId)}
                    isGroup={true}
                    onClick={(e) => handleObjectClick(groupId, e)}
                    onContextMenu={(e) => handleContextMenu(e, groupId)}
                  />
                  {/* Group children */}
                  <div className="ml-4">
                    {groupObjects.map(obj => (
                      <ObjectItem
                        key={obj.id}
                        object={obj}
                        isSelected={selection.selectedIds.includes(obj.id)}
                        onClick={(e) => handleObjectClick(obj.id, e)}
                        onContextMenu={(e) => handleContextMenu(e, obj.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Render ungrouped objects */}
            {groupedObjects.ungrouped.map(obj => (
              <ObjectItem
                key={obj.id}
                object={obj}
                isSelected={selection.selectedIds.includes(obj.id)}
                onClick={(e) => handleObjectClick(obj.id, e)}
                onContextMenu={(e) => handleContextMenu(e, obj.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-white rounded-md shadow-lg py-1 min-w-[150px]"
          style={{
            left: showContextMenu.x,
            top: showContextMenu.y,
            backgroundColor: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.primary}`
          }}
        >
          {contextMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              disabled={item.disabled}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ color: theme.colors.text.primary }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close context menu */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(null)}
        />
      )}
    </div>
  );
}
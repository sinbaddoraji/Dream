import React, { useEffect, useRef, useState } from 'react';
import { useDesignStore } from '../../store/designStore';
import { selectionManager } from '../../utils/SelectionManager';
import type { SelectionBounds, SelectionHandle } from '../../utils/SelectionManager';
import { useTheme } from '../../hooks/useTheme';
import { ContextMenu } from './ContextMenu';

export function SelectionOverlay() {
  const { theme } = useTheme();
  const {
    selection,
    getSelectedObjects,
    setSelectionBounds,
    setTransformMode,
    clearSelection,
  } = useDesignStore();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectionBounds, setLocalSelectionBounds] = useState<SelectionBounds | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<SelectionHandle | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Update selection bounds when selection changes
  useEffect(() => {
    const selectedObjects = getSelectedObjects();
    if (selectedObjects.length > 0) {
      const bounds = selectionManager.calculateSelectionBounds(selectedObjects);
      setLocalSelectionBounds(bounds);
      setSelectionBounds(bounds?.x !== undefined ? 
        new paper.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height) : 
        undefined
      );
    } else {
      setLocalSelectionBounds(null);
      setSelectionBounds(undefined);
    }
  }, [selection.selectedIds, getSelectedObjects, setSelectionBounds]);

  // Handle mouse events for selection and transformation
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!selectionBounds || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const point = new paper.Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    // Check if clicking on a handle
    const handle = selectionManager.hitTestHandle(point, selectionBounds.handles);
    if (handle) {
      setActiveHandle(handle);
      setIsDragging(true);
      
      if (handle.type === 'resize') {
        setTransformMode('resize');
        selectionManager.startTransform('resize', handle, selectionBounds);
      } else if (handle.type === 'rotate') {
        setTransformMode('rotate');
        selectionManager.startTransform('rotate', handle, selectionBounds);
      }
    } else {
      // Check if clicking inside selection bounds
      const boundsRect = new paper.Rectangle(
        selectionBounds.x,
        selectionBounds.y,
        selectionBounds.width,
        selectionBounds.height
      );
      
      if (boundsRect.contains(point)) {
        setTransformMode('move');
        selectionManager.startTransform('move', undefined, selectionBounds);
        setIsDragging(true);
      } else {
        // Clicking outside selection - clear it
        if (!event.shiftKey) {
          clearSelection();
        }
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !selectionBounds || !activeHandle && selection.transformMode !== 'move') return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentPoint = new paper.Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    const delta = currentPoint.subtract(
      activeHandle?.point || selectionBounds.center
    );

    const selectedObjects = getSelectedObjects();
    const newBounds = selectionManager.updateTransform(
      delta,
      selectedObjects,
      selectionBounds,
      event.shiftKey
    );

    setLocalSelectionBounds(newBounds);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
    setTransformMode(null);
    selectionManager.endTransform();
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (selectionBounds && selection.selectedIds.length > 0) {
      setContextMenu({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Handle cursor changes
  const getCursor = (event: React.MouseEvent): string => {
    if (!selectionBounds || !overlayRef.current) return 'default';

    const rect = overlayRef.current.getBoundingClientRect();
    const point = new paper.Point(
      event.clientX - rect.left,
      event.clientY - rect.top
    );

    const handle = selectionManager.hitTestHandle(point, selectionBounds.handles);
    if (handle) {
      return handle.cursor;
    }

    const boundsRect = new paper.Rectangle(
      selectionBounds.x,
      selectionBounds.y,
      selectionBounds.width,
      selectionBounds.height
    );

    return boundsRect.contains(point) ? 'move' : 'default';
  };

  const [cursor, setCursor] = useState('default');

  const handleMouseMoveForCursor = (event: React.MouseEvent) => {
    if (!isDragging) {
      setCursor(getCursor(event));
    }
    handleMouseMove(event);
  };

  if (!selectionBounds) return null;

  const handleSize = 8;
  const handleHalfSize = handleSize / 2;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ cursor }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveForCursor}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Selection bounds rectangle */}
      <div
        className="absolute border-2 border-blue-500 pointer-events-none"
        style={{
          left: selectionBounds.x - 1,
          top: selectionBounds.y - 1,
          width: selectionBounds.width + 2,
          height: selectionBounds.height + 2,
          borderColor: theme.colors.canvas.selection || '#007AFF',
          borderStyle: selection.selectedIds.length > 1 ? 'dashed' : 'solid',
        }}
      />

      {/* Selection handles */}
      {selectionBounds.handles.map((handle, index) => (
        <div
          key={`${handle.type}-${handle.position}-${index}`}
          className="absolute bg-white border-2 border-blue-500 pointer-events-auto"
          style={{
            left: handle.point.x - handleHalfSize,
            top: handle.point.y - handleHalfSize,
            width: handleSize,
            height: handleSize,
            borderColor: theme.colors.canvas.selection || '#007AFF',
            backgroundColor: '#FFFFFF',
            borderRadius: handle.type === 'rotate' ? '50%' : '2px',
            cursor: handle.cursor,
            transform: handle.type === 'rotate' ? 'scale(1.2)' : 'none',
          }}
        />
      ))}

      {/* Rotation indicator line */}
      {selectionBounds.handles.find(h => h.type === 'rotate') && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: selectionBounds.center.x,
            top: selectionBounds.y,
            width: 1,
            height: 30,
            backgroundColor: theme.colors.canvas.selection || '#007AFF',
            transformOrigin: 'bottom center',
          }}
        />
      )}

      {/* Selection info */}
      {selection.selectedIds.length > 0 && (
        <div
          className="absolute bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{
            left: selectionBounds.x,
            top: selectionBounds.y - 25,
            fontSize: '11px',
          }}
        >
          {selection.selectedIds.length} item{selection.selectedIds.length > 1 ? 's' : ''} selected
          {selectionBounds.width > 0 && selectionBounds.height > 0 && (
            <span className="ml-2">
              {Math.round(selectionBounds.width)} × {Math.round(selectionBounds.height)}
            </span>
          )}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}
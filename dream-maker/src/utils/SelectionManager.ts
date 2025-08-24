import paper from 'paper';
import { CanvasObject } from '../store/designStore';

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  center: paper.Point;
  handles: SelectionHandle[];
}

export interface SelectionHandle {
  type: 'resize' | 'rotate';
  position: 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' | 'rotate';
  point: paper.Point;
  cursor: string;
}

export class SelectionManager {
  private marqueeStart: paper.Point | null = null;
  private marqueeRect: paper.Path.Rectangle | null = null;
  private selectionBounds: paper.Rectangle | null = null;
  private transformMode: 'move' | 'resize' | 'rotate' | null = null;
  private resizeHandle: SelectionHandle | null = null;
  private originalBounds: paper.Rectangle | null = null;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Keyboard event listeners for copy/paste, delete, etc.
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Will be implemented with keyboard shortcuts
  }

  // Marquee selection
  startMarqueeSelection(point: paper.Point) {
    this.marqueeStart = point.clone();
    this.createMarqueeRect(point, point);
  }

  updateMarqueeSelection(point: paper.Point) {
    if (!this.marqueeStart) return;
    
    this.updateMarqueeRect(this.marqueeStart, point);
  }

  endMarqueeSelection(objects: Record<string, CanvasObject>): string[] {
    if (!this.marqueeRect || !this.marqueeStart) return [];

    const selectedIds: string[] = [];
    const marqueeBounds = this.marqueeRect.bounds;

    // Check which objects intersect with the marquee
    Object.entries(objects).forEach(([id, obj]) => {
      if (obj.locked || !obj.visible) return;
      
      const itemBounds = obj.paperItem.bounds;
      if (marqueeBounds.intersects(itemBounds)) {
        selectedIds.push(id);
      }
    });

    this.clearMarquee();
    return selectedIds;
  }

  private createMarqueeRect(from: paper.Point, to: paper.Point) {
    this.marqueeRect = new paper.Path.Rectangle(from, to);
    this.marqueeRect.strokeColor = new paper.Color('#007AFF');
    this.marqueeRect.strokeWidth = 1;
    this.marqueeRect.dashArray = [5, 5];
    this.marqueeRect.fillColor = new paper.Color('#007AFF');
    this.marqueeRect.fillColor.alpha = 0.1;
  }

  private updateMarqueeRect(from: paper.Point, to: paper.Point) {
    if (this.marqueeRect) {
      this.marqueeRect.remove();
      this.createMarqueeRect(from, to);
    }
  }

  private clearMarquee() {
    if (this.marqueeRect) {
      this.marqueeRect.remove();
      this.marqueeRect = null;
    }
    this.marqueeStart = null;
  }

  // Selection bounds calculation
  calculateSelectionBounds(objects: CanvasObject[]): SelectionBounds | null {
    if (objects.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
      const bounds = obj.paperItem.bounds;
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.right);
      maxY = Math.max(maxY, bounds.bottom);
    });

    const x = minX;
    const y = minY;
    const width = maxX - minX;
    const height = maxY - minY;
    const center = new paper.Point(x + width / 2, y + height / 2);

    return {
      x,
      y,
      width,
      height,
      center,
      handles: this.createSelectionHandles(x, y, width, height)
    };
  }

  private createSelectionHandles(x: number, y: number, width: number, height: number): SelectionHandle[] {
    const handles: SelectionHandle[] = [];
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const centerX = x + halfWidth;
    const centerY = y + halfHeight;

    // Resize handles
    const resizeHandles: Array<{ type: SelectionHandle['position'], point: paper.Point, cursor: string }> = [
      { type: 'nw', point: new paper.Point(x, y), cursor: 'nw-resize' },
      { type: 'n', point: new paper.Point(centerX, y), cursor: 'n-resize' },
      { type: 'ne', point: new paper.Point(x + width, y), cursor: 'ne-resize' },
      { type: 'w', point: new paper.Point(x, centerY), cursor: 'w-resize' },
      { type: 'e', point: new paper.Point(x + width, centerY), cursor: 'e-resize' },
      { type: 'sw', point: new paper.Point(x, y + height), cursor: 'sw-resize' },
      { type: 's', point: new paper.Point(centerX, y + height), cursor: 's-resize' },
      { type: 'se', point: new paper.Point(x + width, y + height), cursor: 'se-resize' },
    ];

    resizeHandles.forEach(handle => {
      handles.push({
        type: 'resize',
        position: handle.type,
        point: handle.point,
        cursor: handle.cursor
      });
    });

    // Rotation handle (above the selection)
    handles.push({
      type: 'rotate',
      position: 'rotate',
      point: new paper.Point(centerX, y - 30),
      cursor: 'grab'
    });

    return handles;
  }

  // Hit testing for selection handles
  hitTestHandle(point: paper.Point, handles: SelectionHandle[]): SelectionHandle | null {
    const tolerance = 8;
    
    for (const handle of handles) {
      const distance = point.getDistance(handle.point);
      if (distance <= tolerance) {
        return handle;
      }
    }
    
    return null;
  }

  // Transform operations
  startTransform(mode: 'move' | 'resize' | 'rotate', handle?: SelectionHandle, bounds?: SelectionBounds) {
    this.transformMode = mode;
    this.resizeHandle = handle || null;
    this.originalBounds = bounds ? new paper.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height) : null;
  }

  updateTransform(
    delta: paper.Point, 
    objects: CanvasObject[], 
    bounds: SelectionBounds,
    shiftKey = false
  ): SelectionBounds {
    switch (this.transformMode) {
      case 'move':
        return this.updateMove(delta, objects, bounds);
      case 'resize':
        return this.updateResize(delta, objects, bounds, shiftKey);
      case 'rotate':
        return this.updateRotate(delta, objects, bounds);
      default:
        return bounds;
    }
  }

  private updateMove(delta: paper.Point, objects: CanvasObject[], bounds: SelectionBounds): SelectionBounds {
    objects.forEach(obj => {
      obj.paperItem.position = obj.paperItem.position.add(delta);
    });

    return {
      ...bounds,
      x: bounds.x + delta.x,
      y: bounds.y + delta.y,
      center: bounds.center.add(delta),
      handles: bounds.handles.map(handle => ({
        ...handle,
        point: handle.point.add(delta)
      }))
    };
  }

  private updateResize(
    delta: paper.Point, 
    objects: CanvasObject[], 
    bounds: SelectionBounds, 
    proportional = false
  ): SelectionBounds {
    if (!this.resizeHandle || !this.originalBounds) return bounds;

    const handle = this.resizeHandle;
    const original = this.originalBounds;
    let newBounds = { ...bounds };

    // Calculate new bounds based on handle position
    switch (handle.position) {
      case 'nw':
        newBounds.width = original.width - delta.x;
        newBounds.height = original.height - delta.y;
        newBounds.x = original.x + delta.x;
        newBounds.y = original.y + delta.y;
        break;
      case 'n':
        newBounds.height = original.height - delta.y;
        newBounds.y = original.y + delta.y;
        break;
      case 'ne':
        newBounds.width = original.width + delta.x;
        newBounds.height = original.height - delta.y;
        newBounds.y = original.y + delta.y;
        break;
      case 'w':
        newBounds.width = original.width - delta.x;
        newBounds.x = original.x + delta.x;
        break;
      case 'e':
        newBounds.width = original.width + delta.x;
        break;
      case 'sw':
        newBounds.width = original.width - delta.x;
        newBounds.height = original.height + delta.y;
        newBounds.x = original.x + delta.x;
        break;
      case 's':
        newBounds.height = original.height + delta.y;
        break;
      case 'se':
        newBounds.width = original.width + delta.x;
        newBounds.height = original.height + delta.y;
        break;
    }

    // Maintain aspect ratio if shift key is held
    if (proportional) {
      const aspectRatio = original.width / original.height;
      if (Math.abs(delta.x) > Math.abs(delta.y)) {
        newBounds.height = newBounds.width / aspectRatio;
      } else {
        newBounds.width = newBounds.height * aspectRatio;
      }
    }

    // Apply transformation to objects
    const scaleX = newBounds.width / original.width;
    const scaleY = newBounds.height / original.height;

    objects.forEach(obj => {
      obj.paperItem.scale(scaleX, scaleY, new paper.Point(original.center.x, original.center.y));
    });

    // Update center and handles
    newBounds.center = new paper.Point(newBounds.x + newBounds.width / 2, newBounds.y + newBounds.height / 2);
    newBounds.handles = this.createSelectionHandles(newBounds.x, newBounds.y, newBounds.width, newBounds.height);

    return newBounds;
  }

  private updateRotate(delta: paper.Point, objects: CanvasObject[], bounds: SelectionBounds): SelectionBounds {
    const angle = Math.atan2(delta.y, delta.x) * 180 / Math.PI;
    
    objects.forEach(obj => {
      obj.paperItem.rotate(angle, bounds.center);
    });

    return bounds;
  }

  endTransform() {
    this.transformMode = null;
    this.resizeHandle = null;
    this.originalBounds = null;
  }

  // Lasso selection
  createLassoPath(): paper.Path {
    const path = new paper.Path();
    path.strokeColor = new paper.Color('#007AFF');
    path.strokeWidth = 2;
    path.dashArray = [5, 5];
    return path;
  }

  updateLassoPath(path: paper.Path, point: paper.Point) {
    path.add(point);
  }

  finalizeLassoSelection(path: paper.Path, objects: Record<string, CanvasObject>): string[] {
    path.closed = true;
    const selectedIds: string[] = [];

    Object.entries(objects).forEach(([id, obj]) => {
      if (obj.locked || !obj.visible) return;
      
      // Check if object's center is inside the lasso path
      const center = obj.paperItem.bounds.center;
      if (path.contains(center)) {
        selectedIds.push(id);
      }
    });

    path.remove();
    return selectedIds;
  }

  // Cleanup
  cleanup() {
    this.clearMarquee();
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export const selectionManager = new SelectionManager();
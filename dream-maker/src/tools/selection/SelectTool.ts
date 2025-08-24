import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';
import { selectionManager } from '../../utils/SelectionManager';

export class SelectTool extends DrawingTool {
  private hitItem: paper.Item | null = null;
  private hitObjectId: string | null = null;
  private isMarqueeSelecting: boolean = false;

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    
    const hitResult = paper.project.hitTest(event.point, {
      fill: true,
      stroke: true
    });

    if (hitResult && hitResult.item) {
      this.handleItemHit(hitResult.item, event);
    } else {
      this.startMarqueeSelection(event);
    }
  }

  private handleItemHit(item: paper.Item, event: paper.ToolEvent): void {
    this.hitItem = item;
    
    this.hitObjectId = Object.entries(this.context.objects)
      .find(([, obj]) => obj.paperItem === item)?.[0] || null;
    
    if (this.hitObjectId) {
      if (event.modifiers.shift) {
        this.toggleSelection(this.hitObjectId);
      } else {
        this.context.selectObjects([this.hitObjectId]);
      }
    }
    
    if (this.context.onSelectionChange) {
      this.context.onSelectionChange([item]);
    }
  }

  private toggleSelection(objectId: string): void {
    if (this.context.selection.selectedIds.includes(objectId)) {
      const newSelection = this.context.selection.selectedIds.filter(id => id !== objectId);
      this.context.selectObjects(newSelection);
    } else {
      this.context.addToSelection([objectId]);
    }
  }

  private startMarqueeSelection(event: paper.ToolEvent): void {
    if (!event.modifiers.shift) {
      this.context.clearSelection();
      if (this.context.onSelectionChange) {
        this.context.onSelectionChange([]);
      }
    }
    
    this.isMarqueeSelecting = true;
    selectionManager.startMarqueeSelection(event.point);
    this.hitItem = null;
    this.hitObjectId = null;
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (this.hitItem && this.hitObjectId && !this.isMarqueeSelecting) {
      this.moveSelectedObjects(event.delta);
    } else if (this.isMarqueeSelecting) {
      selectionManager.updateMarqueeSelection(event.point);
    }
  }

  private moveSelectedObjects(delta: paper.Point): void {
    const selectedObjects = Object.entries(this.context.objects)
      .filter(([id]) => this.context.selection.selectedIds.includes(id))
      .map(([, obj]) => obj);
    
    selectedObjects.forEach(obj => {
      obj.paperItem.position = obj.paperItem.position.add(delta);
    });
  }

  protected onMouseUp(event: paper.ToolEvent): void {
    if (this.isMarqueeSelecting) {
      this.completeMarqueeSelection(event);
    }
    
    this.hitItem = null;
    this.hitObjectId = null;
  }

  private completeMarqueeSelection(event: paper.ToolEvent): void {
    const selectedIds = selectionManager.endMarqueeSelection(this.context.objects);
    
    if (selectedIds.length > 0) {
      if (event.modifiers.shift) {
        this.context.addToSelection(selectedIds);
      } else {
        this.context.selectObjects(selectedIds);
      }
      
      if (this.context.onSelectionChange) {
        const selectedItems = selectedIds
          .map(id => this.context.objects[id]?.paperItem)
          .filter(Boolean);
        this.context.onSelectionChange(selectedItems);
      }
    }
    
    this.isMarqueeSelecting = false;
  }
}
import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';
import type { ToolConfig, ToolContext } from '../base/DrawingTool';

export abstract class ShapeTool extends DrawingTool {
  protected startPoint: paper.Point | null = null;

  constructor(config: ToolConfig, context: ToolContext) {
    super(config, context);
  }

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    this.startPoint = event.point;
    this.currentItem = this.createShape(event.point, event.point);
    this.applyStyles(this.currentItem as paper.Path);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (this.currentItem && this.startPoint) {
      this.currentItem.remove();
      this.currentItem = this.createShape(this.startPoint, event.point);
      this.applyStyles(this.currentItem as paper.Path);
    }
  }

  protected onMouseUp(): void {
    if (this.currentItem) {
      const canvasObject = this.createCanvasObject(this.currentItem, 'shape');
      this.context.addObject(canvasObject);
      this.currentItem = null;
      this.startPoint = null;
    }
  }

  protected abstract createShape(from: paper.Point, to: paper.Point): paper.Item;
}
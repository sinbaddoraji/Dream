import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';

export class PenTool extends DrawingTool {
  protected path: paper.Path | null = null;

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    this.path = new paper.Path();
    this.path.add(event.point);
    this.applyStyles(this.path);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (this.path) {
      this.path.add(event.point);
    }
  }

  protected onMouseUp(): void {
    if (this.path) {
      this.path.smooth();
      const canvasObject = this.createCanvasObject(this.path, 'path');
      this.context.addObject(canvasObject);
      this.path = null;
    }
  }
}
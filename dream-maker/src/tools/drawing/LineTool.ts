import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';

export class LineTool extends DrawingTool {
  protected line: paper.Path | null = null;
  protected startPoint: paper.Point | null = null;

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    this.startPoint = event.point;
    this.line = new paper.Path();
    this.line.add(event.point);
    this.applyStyles(this.line);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (this.line && this.line.segments.length > 1) {
      this.line.removeSegment(1);
    }
    if (this.line) {
      this.line.add(event.point);
    }
  }

  protected onMouseUp(): void {
    if (this.line) {
      const canvasObject = this.createCanvasObject(this.line, 'path');
      this.context.addObject(canvasObject);
      this.line = null;
      this.startPoint = null;
    }
  }
}
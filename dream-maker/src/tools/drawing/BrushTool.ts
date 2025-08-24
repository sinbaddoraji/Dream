import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';

export class BrushTool extends DrawingTool {
  protected path: paper.Path | null = null;
  protected brushMultiplier: number = 4;
  protected smoothingFactor: number = 0.5;

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
    this.tool.onMouseUp = this.onMouseUp.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    this.path = new paper.Path();
    this.path.strokeColor = new paper.Color(this.config.strokeColor);
    this.path.strokeWidth = this.config.strokeWidth * this.brushMultiplier;
    this.path.strokeCap = 'round';
    this.path.add(event.point);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (this.path) {
      this.path.add(event.point);
      this.path.smooth({ type: 'catmull-rom', factor: this.smoothingFactor });
    }
  }

  protected onMouseUp(): void {
    if (this.path) {
      const canvasObject = this.createCanvasObject(this.path, 'path');
      this.context.addObject(canvasObject);
      this.path = null;
    }
  }

  public setBrushMultiplier(multiplier: number): void {
    this.brushMultiplier = multiplier;
  }

  public setSmoothingFactor(factor: number): void {
    this.smoothingFactor = Math.max(0, Math.min(1, factor));
  }
}

export class PaintbrushTool extends BrushTool {
  protected brushMultiplier: number = 6;
  protected smoothingFactor: number = 0.8;

  protected onMouseDown(event: paper.ToolEvent): void {
    this.path = new paper.Path();
    this.path.strokeColor = new paper.Color(this.config.fillColor);
    this.path.strokeWidth = this.config.strokeWidth * this.brushMultiplier;
    this.path.strokeCap = 'round';
    this.path.add(event.point);
  }
}
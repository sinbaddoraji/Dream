import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';

export class EraserTool extends DrawingTool {
  private tolerance: number = 8;

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    this.eraseAt(event.point, 5);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    this.eraseAt(event.point, this.tolerance);
  }

  private eraseAt(point: paper.Point, tolerance: number): void {
    const hitResult = paper.project.hitTest(point, {
      fill: true,
      stroke: true,
      tolerance
    });
    
    if (hitResult && hitResult.item) {
      const objectId = Object.entries(this.context.objects)
        .find(([_, obj]) => obj.paperItem === hitResult.item)?.[0];
      
      if (objectId) {
        this.context.deleteObjects([objectId]);
      }
    }
  }

  public setTolerance(tolerance: number): void {
    this.tolerance = Math.max(1, Math.min(20, tolerance));
  }
}
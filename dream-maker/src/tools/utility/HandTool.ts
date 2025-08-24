import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';

export class HandTool extends DrawingTool {
  protected setupTool(): void {
    this.tool.onMouseDrag = this.onMouseDrag.bind(this);
  }

  protected onMouseDrag(event: paper.ToolEvent): void {
    if (paper.view) {
      paper.view.center = paper.view.center.subtract(event.delta);
    }
  }
}
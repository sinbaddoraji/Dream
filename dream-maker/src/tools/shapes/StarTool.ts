import paper from 'paper';
import { ShapeTool } from './ShapeTool';

export class StarTool extends ShapeTool {
  protected points: number = 5;
  protected innerRadiusRatio: number = 0.5;

  protected createShape(from: paper.Point, to: paper.Point): paper.Path.Star {
    const center = from.add(to).divide(2);
    const radius = from.getDistance(to) / 2;
    
    return new paper.Path.Star({
      center: center,
      points: this.points,
      radius1: radius,
      radius2: radius * this.innerRadiusRatio
    });
  }

  public setPoints(points: number): void {
    this.points = points;
  }

  public setInnerRadiusRatio(ratio: number): void {
    this.innerRadiusRatio = Math.max(0.1, Math.min(1, ratio));
  }
}
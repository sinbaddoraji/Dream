import paper from 'paper';
import { ShapeTool } from './ShapeTool';

export class EllipseTool extends ShapeTool {
  protected createShape(from: paper.Point, to: paper.Point): paper.Path.Ellipse {
    const rectangle = new paper.Rectangle(from, to);
    return new paper.Path.Ellipse(rectangle);
  }
}
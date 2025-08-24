import paper from 'paper';
import { ShapeTool } from './ShapeTool';

export class RectangleTool extends ShapeTool {
  protected createShape(from: paper.Point, to: paper.Point): paper.Path.Rectangle {
    return new paper.Path.Rectangle(from, to);
  }
}
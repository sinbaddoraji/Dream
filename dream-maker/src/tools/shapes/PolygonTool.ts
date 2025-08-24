import paper from 'paper';
import { ShapeTool } from './ShapeTool';
import type { ToolConfig, ToolContext } from '../base/DrawingTool';

export class PolygonTool extends ShapeTool {
  protected sides: number;

  constructor(config: ToolConfig, context: ToolContext, sides: number) {
    super(config, context);
    this.sides = sides;
  }

  protected createShape(from: paper.Point, to: paper.Point): paper.Path.RegularPolygon {
    const center = from.add(to).divide(2);
    const radius = from.getDistance(to) / 2;
    
    return new paper.Path.RegularPolygon({
      center: center,
      sides: this.sides,
      radius: radius
    });
  }
}

export class TriangleTool extends PolygonTool {
  constructor(config: ToolConfig, context: ToolContext) {
    super(config, context, 3);
  }
}

export class PentagonTool extends PolygonTool {
  constructor(config: ToolConfig, context: ToolContext) {
    super(config, context, 5);
  }
}

export class HexagonTool extends PolygonTool {
  constructor(config: ToolConfig, context: ToolContext) {
    super(config, context, 6);
  }
}

export class OctagonTool extends PolygonTool {
  constructor(config: ToolConfig, context: ToolContext) {
    super(config, context, 8);
  }
}
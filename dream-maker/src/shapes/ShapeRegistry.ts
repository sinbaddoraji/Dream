import paper from 'paper';

export interface ShapeDefinition {
  id: string;
  label: string;
  icon?: string;
  category: 'basic' | 'polygon' | 'custom';
  createShape: (from: paper.Point, to: paper.Point, options?: ShapeOptions) => paper.Item;
}

export interface ShapeOptions {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  sides?: number;
  points?: number;
  innerRadius?: number;
  cornerRadius?: number;
}

export class ShapeRegistry {
  private static shapes: Map<string, ShapeDefinition> = new Map();

  static {
    this.registerDefaultShapes();
  }

  private static registerDefaultShapes(): void {
    this.register({
      id: 'rectangle',
      label: 'Rectangle',
      category: 'basic',
      createShape: (from, to, options) => {
        const rect = new paper.Path.Rectangle(from, to);
        if (options?.cornerRadius) {
          // Apply corner radius when supported by Paper.js
        }
        return rect;
      }
    });

    this.register({
      id: 'ellipse',
      label: 'Ellipse',
      category: 'basic',
      createShape: (from, to) => {
        const rectangle = new paper.Rectangle(from, to);
        return new paper.Path.Ellipse(rectangle);
      }
    });

    this.register({
      id: 'circle',
      label: 'Circle',
      category: 'basic',
      createShape: (from, to) => {
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        return new paper.Path.Circle(center, radius);
      }
    });

    this.register({
      id: 'line',
      label: 'Line',
      category: 'basic',
      createShape: (from, to) => {
        const path = new paper.Path();
        path.add(from);
        path.add(to);
        return path;
      }
    });

    this.register({
      id: 'triangle',
      label: 'Triangle',
      category: 'polygon',
      createShape: (from, to) => {
        return this.createPolygon(from, to, 3);
      }
    });

    this.register({
      id: 'pentagon',
      label: 'Pentagon',
      category: 'polygon',
      createShape: (from, to) => {
        return this.createPolygon(from, to, 5);
      }
    });

    this.register({
      id: 'hexagon',
      label: 'Hexagon',
      category: 'polygon',
      createShape: (from, to) => {
        return this.createPolygon(from, to, 6);
      }
    });

    this.register({
      id: 'octagon',
      label: 'Octagon',
      category: 'polygon',
      createShape: (from, to) => {
        return this.createPolygon(from, to, 8);
      }
    });

    this.register({
      id: 'star',
      label: 'Star',
      category: 'polygon',
      createShape: (from, to, options) => {
        const center = from.add(to).divide(2);
        const radius = from.getDistance(to) / 2;
        const points = options?.points || 5;
        const innerRadius = options?.innerRadius || radius * 0.5;
        
        return new paper.Path.Star({
          center: center,
          points: points,
          radius1: radius,
          radius2: innerRadius
        });
      }
    });

    this.register({
      id: 'arrow',
      label: 'Arrow',
      category: 'custom',
      createShape: (from, to) => {
        const direction = to.subtract(from);
        const arrowHead = new paper.Path();
        
        arrowHead.add(from);
        arrowHead.add(to);
        
        const arrowSize = 15;
        const angle = 30;
        const headAngle1 = direction.angle + 180 - angle;
        const headAngle2 = direction.angle + 180 + angle;
        
        const head1 = to.add(new paper.Point({
          angle: headAngle1,
          length: arrowSize
        }));
        
        const head2 = to.add(new paper.Point({
          angle: headAngle2,
          length: arrowSize
        }));
        
        arrowHead.add(head1);
        arrowHead.moveTo(to);
        arrowHead.add(head2);
        
        return arrowHead;
      }
    });

    this.register({
      id: 'heart',
      label: 'Heart',
      category: 'custom',
      createShape: (from, to) => {
        const width = Math.abs(to.x - from.x);
        const height = Math.abs(to.y - from.y);
        const center = from.add(to).divide(2);
        
        const path = new paper.Path();
        const scale = Math.min(width, height) / 100;
        
        path.moveTo(center.add([0, 25 * scale]));
        path.cubicCurveTo(
          center.add([0, 12.5 * scale]),
          center.add([-25 * scale, 0]),
          center.add([-25 * scale, -12.5 * scale])
        );
        path.arcTo(
          center.add([0, -25 * scale]),
          center.add([0, -12.5 * scale])
        );
        path.arcTo(
          center.add([25 * scale, -12.5 * scale]),
          center.add([25 * scale, 0])
        );
        path.cubicCurveTo(
          center.add([25 * scale, 0]),
          center.add([0, 12.5 * scale]),
          center.add([0, 25 * scale])
        );
        path.closed = true;
        
        return path;
      }
    });
  }

  private static createPolygon(from: paper.Point, to: paper.Point, sides: number): paper.Path.RegularPolygon {
    const center = from.add(to).divide(2);
    const radius = from.getDistance(to) / 2;
    
    return new paper.Path.RegularPolygon({
      center: center,
      sides: sides,
      radius: radius
    });
  }

  public static register(shape: ShapeDefinition): void {
    this.shapes.set(shape.id, shape);
  }

  public static unregister(id: string): void {
    this.shapes.delete(id);
  }

  public static get(id: string): ShapeDefinition | undefined {
    return this.shapes.get(id);
  }

  public static getAll(): ShapeDefinition[] {
    return Array.from(this.shapes.values());
  }

  public static getByCategory(category: ShapeDefinition['category']): ShapeDefinition[] {
    return this.getAll().filter(shape => shape.category === category);
  }

  public static createShape(
    id: string,
    from: paper.Point,
    to: paper.Point,
    options?: ShapeOptions
  ): paper.Item | null {
    const shape = this.get(id);
    if (!shape) {
      console.warn(`Shape "${id}" not found in registry`);
      return null;
    }
    
    const item = shape.createShape(from, to, options);
    
    if (options) {
      if (options.fillColor && 'fillColor' in item) {
        (item as paper.Path).fillColor = new paper.Color(options.fillColor);
      }
      if (options.strokeColor && 'strokeColor' in item) {
        (item as paper.Path).strokeColor = new paper.Color(options.strokeColor);
      }
      if (options.strokeWidth && 'strokeWidth' in item) {
        (item as paper.Path).strokeWidth = options.strokeWidth;
      }
    }
    
    return item;
  }
}
import { DrawingTool, ToolConfig, ToolContext } from './base/DrawingTool';
import { SelectTool } from './selection/SelectTool';
import { RectangleTool } from './shapes/RectangleTool';
import { EllipseTool } from './shapes/EllipseTool';
import { TriangleTool, PentagonTool, HexagonTool, OctagonTool } from './shapes/PolygonTool';
import { StarTool } from './shapes/StarTool';
import { LineTool } from './drawing/LineTool';
import { PenTool } from './drawing/PenTool';
import { BrushTool, PaintbrushTool } from './drawing/BrushTool';
import { EraserTool } from './utility/EraserTool';
import { HandTool } from './utility/HandTool';
import { TextTool } from './text/TextTool';

export type ToolType = 
  | 'select' 
  | 'lasso'
  | 'magic-wand'
  | 'rectangle' 
  | 'ellipse' 
  | 'triangle'
  | 'star'
  | 'hexagon'
  | 'pentagon'
  | 'octagon'
  | 'line' 
  | 'pen' 
  | 'brush'
  | 'paintbrush'
  | 'eraser'
  | 'text' 
  | 'crop'
  | 'hand';

export class ToolFactory {
  private static toolRegistry: Map<ToolType, any> = new Map([
    ['select', SelectTool],
    ['rectangle', RectangleTool],
    ['ellipse', EllipseTool],
    ['triangle', TriangleTool],
    ['pentagon', PentagonTool],
    ['hexagon', HexagonTool],
    ['octagon', OctagonTool],
    ['star', StarTool],
    ['line', LineTool],
    ['pen', PenTool],
    ['brush', BrushTool],
    ['paintbrush', PaintbrushTool],
    ['eraser', EraserTool],
    ['hand', HandTool],
    ['text', TextTool],
  ]);

  public static createTool(
    type: ToolType,
    config: ToolConfig,
    context: ToolContext
  ): DrawingTool | null {
    const ToolClass = this.toolRegistry.get(type);
    
    if (!ToolClass) {
      console.warn(`Tool type "${type}" not found in registry`);
      return null;
    }

    return new (ToolClass as any)(config, context);
  }

  public static registerTool(type: ToolType, toolClass: any): void {
    this.toolRegistry.set(type, toolClass);
  }

  public static unregisterTool(type: ToolType): void {
    this.toolRegistry.delete(type);
  }

  public static getAvailableTools(): ToolType[] {
    return Array.from(this.toolRegistry.keys());
  }

  public static hasToolType(type: string): type is ToolType {
    return this.toolRegistry.has(type as ToolType);
  }
}
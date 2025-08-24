import paper from 'paper';
import type { CanvasObject } from '../../store/designStore';

export interface ToolConfig {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface ToolContext {
  addObject: (object: CanvasObject) => void;
  deleteObjects: (ids: string[]) => void;
  selectObjects: (ids: string[]) => void;
  addToSelection: (ids: string[]) => void;
  clearSelection: () => void;
  objects: Record<string, CanvasObject>;
  selection: { selectedIds: string[] };
  onSelectionChange?: (items: paper.Item[]) => void;
}

export abstract class DrawingTool {
  protected tool: paper.Tool;
  protected config: ToolConfig;
  protected context: ToolContext;
  protected currentItem: paper.Item | null = null;

  constructor(config: ToolConfig, context: ToolContext) {
    this.config = config;
    this.context = context;
    this.tool = new paper.Tool();
    this.setupTool();
  }

  protected abstract setupTool(): void;

  public activate(): void {
    this.tool.activate();
  }

  public deactivate(): void {
    if (this.currentItem) {
      this.currentItem = null;
    }
  }

  public remove(): void {
    this.tool.remove();
  }

  public updateConfig(config: Partial<ToolConfig>): void {
    this.config = { ...this.config, ...config };
  }

  protected generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  protected createCanvasObject(paperItem: paper.Item, type: CanvasObject['type']): CanvasObject {
    return {
      id: this.generateId(),
      paperItem,
      type,
      locked: false,
      visible: true,
      name: `${type} ${Object.keys(this.context.objects).length + 1}`
    };
  }

  protected applyStyles(item: paper.Path | paper.Shape): void {
    if ('strokeColor' in item) {
      item.strokeColor = new paper.Color(this.config.strokeColor);
    }
    if ('fillColor' in item) {
      item.fillColor = new paper.Color(this.config.fillColor);
    }
    if ('strokeWidth' in item) {
      item.strokeWidth = this.config.strokeWidth;
    }
  }
}
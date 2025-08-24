import paper from 'paper';
import { DrawingTool } from '../tools/base/DrawingTool';
import type { ToolConfig, ToolContext } from '../tools/base/DrawingTool';
import { ToolFactory } from '../tools/ToolFactory';
import type { ToolType } from '../tools/ToolFactory';

export class CanvasService {
  private scope: paper.PaperScope | null = null;
  private currentTool: DrawingTool | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private toolConfig: ToolConfig;
  private toolContext: ToolContext;

  constructor(canvas: HTMLCanvasElement, context: ToolContext) {
    this.canvas = canvas;
    this.toolContext = context;
    this.toolConfig = {
      fillColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2
    };
    
    this.initializePaperScope();
  }

  private initializePaperScope(): void {
    if (!this.canvas) return;
    
    this.scope = new paper.PaperScope();
    this.scope.setup(this.canvas);
    this.scope.activate();
    
    this.setupCanvasSize();
    this.setupResizeHandlers();
  }

  private setupCanvasSize(): void {
    if (!this.canvas || !paper.view) return;
    
    this.canvas.width = this.canvas.offsetWidth || 800;
    this.canvas.height = this.canvas.offsetHeight || 600;
    
    paper.view.viewSize = new paper.Size(
      this.canvas.width,
      this.canvas.height
    );
    paper.view.zoom = 1;
    paper.view.center = new paper.Point(0, 0);
  }

  private setupResizeHandlers(): void {
    if (!this.canvas) return;
    
    const handleResize = () => {
      if (this.canvas && paper.view) {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        paper.view.viewSize = new paper.Size(this.canvas.width, this.canvas.height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(handleResize, 10);
      });
      resizeObserver.observe(this.canvas);
    }
  }

  public setActiveTool(toolType: ToolType): void {
    if (!this.scope) return;
    
    this.scope.activate();
    
    if (this.currentTool) {
      this.currentTool.deactivate();
      this.currentTool.remove();
    }
    
    this.currentTool = ToolFactory.createTool(
      toolType,
      this.toolConfig,
      this.toolContext
    );
    
    if (this.currentTool) {
      this.currentTool.activate();
    }
  }

  public updateToolConfig(config: Partial<ToolConfig>): void {
    this.toolConfig = { ...this.toolConfig, ...config };
    
    if (this.currentTool) {
      this.currentTool.updateConfig(config);
    }
  }

  public updateToolContext(context: Partial<ToolContext>): void {
    this.toolContext = { ...this.toolContext, ...context };
  }

  public clear(): void {
    if (paper.project) {
      paper.project.clear();
    }
  }

  public exportSVG(): string {
    if (!paper.project) return '';
    return paper.project.exportSVG({ asString: true }) as string;
  }

  public exportJSON(): string {
    if (!paper.project) return '{}';
    return paper.project.exportJSON();
  }

  public importJSON(json: string): void {
    if (!paper.project) return;
    paper.project.clear();
    paper.project.importJSON(json);
  }

  public zoom(factor: number): void {
    if (paper.view) {
      paper.view.zoom *= factor;
    }
  }

  public pan(delta: paper.Point): void {
    if (paper.view) {
      paper.view.center = paper.view.center.add(delta);
    }
  }

  public resetView(): void {
    if (paper.view) {
      paper.view.zoom = 1;
      paper.view.center = new paper.Point(
        paper.view.viewSize.width / 2,
        paper.view.viewSize.height / 2
      );
    }
  }

  public destroy(): void {
    if (this.currentTool) {
      this.currentTool.deactivate();
      this.currentTool.remove();
    }
    
    if (this.scope && this.scope.project) {
      this.scope.project.clear();
      this.scope.project.remove();
    }
  }
}
import paper from 'paper';
import { DrawingTool } from '../base/DrawingTool';
import type { ToolConfig } from '../base/DrawingTool';

export interface TextConfig extends ToolConfig {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
}

export class TextTool extends DrawingTool {
  private fontSize: number = 16;
  private fontFamily: string = 'Arial';
  private fontWeight: string = 'normal';

  protected setupTool(): void {
    this.tool.onMouseDown = this.onMouseDown.bind(this);
  }

  protected onMouseDown(event: paper.ToolEvent): void {
    const text = new paper.PointText({
      point: event.point,
      content: 'Text',
      fillColor: new paper.Color(this.config.fillColor),
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      fontWeight: this.fontWeight
    });
    
    const canvasObject = this.createCanvasObject(text, 'text');
    this.context.addObject(canvasObject);
  }

  public setFontSize(size: number): void {
    this.fontSize = Math.max(8, Math.min(144, size));
  }

  public setFontFamily(family: string): void {
    this.fontFamily = family;
  }

  public setFontWeight(weight: string): void {
    this.fontWeight = weight;
  }
}
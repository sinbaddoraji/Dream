import type { Command } from './Command';

export class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

  public execute(command: Command): void {
    command.execute();
    
    // Remove any commands after the current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add the new command
    this.history.push(command);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  public undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }
    
    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    
    return true;
  }

  public redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }
    
    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo();
    
    return true;
  }

  public canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  public getHistory(): Command[] {
    return [...this.history];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(excess);
      this.currentIndex = Math.max(-1, this.currentIndex - excess);
    }
  }
}
import type { Command } from './Command';
import type { CanvasObject } from '../types';
import paper from 'paper';

interface Store {
  objects: Record<string, CanvasObject>;
}

export class MoveObjectCommand implements Command {
  private objectIds: string[];
  private delta: { x: number; y: number };
  private store: Store;
  description: string;

  constructor(objectIds: string[], delta: { x: number; y: number }, store: Store) {
    this.objectIds = objectIds;
    this.delta = delta;
    this.store = store;
    this.description = `Move ${objectIds.length} object(s)`;
  }

  execute(): void {
    this.objectIds.forEach(id => {
      const object = this.store.objects[id];
      if (object?.paperItem) {
        object.paperItem.position = object.paperItem.position.add(new paper.Point(this.delta.x, this.delta.y));
      }
    });
  }

  undo(): void {
    this.objectIds.forEach(id => {
      const object = this.store.objects[id];
      if (object?.paperItem) {
        object.paperItem.position = object.paperItem.position.subtract(new paper.Point(this.delta.x, this.delta.y));
      }
    });
  }

  redo(): void {
    this.execute();
  }
}
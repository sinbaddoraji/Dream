import type { Command } from './Command';
import type paper from 'paper';

interface Store {
  objects: Record<string, any>;
}

export class MoveObjectCommand implements Command {
  private objectIds: string[];
  private delta: paper.Point;
  private store: Store;
  description: string;

  constructor(objectIds: string[], delta: paper.Point, store: Store) {
    this.objectIds = objectIds;
    this.delta = delta;
    this.store = store;
    this.description = `Move ${objectIds.length} object(s)`;
  }

  execute(): void {
    this.objectIds.forEach(id => {
      const object = this.store.objects[id];
      if (object?.paperItem) {
        object.paperItem.position = object.paperItem.position.add(this.delta);
      }
    });
  }

  undo(): void {
    this.objectIds.forEach(id => {
      const object = this.store.objects[id];
      if (object?.paperItem) {
        object.paperItem.position = object.paperItem.position.subtract(this.delta);
      }
    });
  }

  redo(): void {
    this.execute();
  }
}
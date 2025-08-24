import type { Command } from './Command';
import type { CanvasObject } from '../store/designStore';
import paper from 'paper';

interface Store {
  addObject: (object: CanvasObject) => void;
  removeObject: (id: string) => void;
}

export class AddObjectCommand implements Command {
  private object: CanvasObject;
  private store: Store;
  description: string;

  constructor(object: CanvasObject, store: Store) {
    this.object = object;
    this.store = store;
    this.description = `Add ${object.type}`;
  }

  execute(): void {
    this.store.addObject(this.object);
  }

  undo(): void {
    this.store.removeObject(this.object.id);
    if (this.object.paperItem) {
      this.object.paperItem.remove();
    }
  }

  redo(): void {
    if (this.object.paperItem && this.object.paperItem.project === null) {
      this.object.paperItem.addTo(paper.project);
    }
    this.store.addObject(this.object);
  }
}
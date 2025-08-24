import type { Command } from './Command';
import type { CanvasObject } from '../store/designStore';
import paper from 'paper';

interface Store {
  addObject: (object: CanvasObject) => void;
  removeObject: (id: string) => void;
  objects: Record<string, CanvasObject>;
}

export class DeleteObjectCommand implements Command {
  private objectIds: string[];
  private deletedObjects: CanvasObject[] = [];
  private store: Store;
  description: string;

  constructor(objectIds: string[], store: Store) {
    this.objectIds = objectIds;
    this.store = store;
    this.description = `Delete ${objectIds.length} object(s)`;
  }

  execute(): void {
    this.deletedObjects = [];
    
    this.objectIds.forEach(id => {
      const object = this.store.objects[id];
      if (object) {
        this.deletedObjects.push({ ...object });
        this.store.removeObject(id);
        if (object.paperItem) {
          object.paperItem.remove();
        }
      }
    });
  }

  undo(): void {
    this.deletedObjects.forEach(object => {
      if (object.paperItem && object.paperItem.project === null) {
        object.paperItem.addTo(paper.project);
      }
      this.store.addObject(object);
    });
  }

  redo(): void {
    this.execute();
  }
}
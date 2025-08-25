export interface DrawAction {
  id: string;
  timestamp: number;
  type: DrawActionType;
  description: string;
  objectIds: string[];
  data: any;
  canvasState?: {
    objectCount: number;
    scale: number;
    position: { x: number; y: number };
  };
}

export type DrawActionType = 
  | 'create_rectangle'
  | 'create_ellipse' 
  | 'create_line'
  | 'create_text'
  | 'create_pen_stroke'
  | 'create_brush_stroke'
  | 'import_image'
  | 'delete_object'
  | 'transform_object'
  | 'move_object'
  | 'clear_canvas';

export interface HistoryState {
  actions: DrawAction[];
  currentIndex: number;
  maxHistorySize: number;
}

export const ACTION_ICONS: Record<DrawActionType, string> = {
  create_rectangle: 'Square',
  create_ellipse: 'Circle',
  create_line: 'Minus',
  create_text: 'Type',
  create_pen_stroke: 'Pen',
  create_brush_stroke: 'Brush',
  import_image: 'Image',
  delete_object: 'Trash2',
  transform_object: 'Move',
  move_object: 'Move',
  clear_canvas: 'X'
};

export const ACTION_DESCRIPTIONS: Record<DrawActionType, string> = {
  create_rectangle: 'Created rectangle',
  create_ellipse: 'Created ellipse',
  create_line: 'Drew line',
  create_text: 'Added text',
  create_pen_stroke: 'Pen stroke',
  create_brush_stroke: 'Brush stroke', 
  import_image: 'Imported image',
  delete_object: 'Deleted object',
  transform_object: 'Transformed object',
  move_object: 'Moved object',
  clear_canvas: 'Cleared canvas'
};
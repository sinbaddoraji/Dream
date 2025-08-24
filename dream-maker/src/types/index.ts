// @ts-expect-error - Paper.js types are used in interface definitions
import type paper from 'paper';

/**
 * Base configuration for all drawing tools
 */
export interface ToolConfig {
  /** Fill color in hex, rgb, or named color format */
  fillColor: string;
  /** Stroke color in hex, rgb, or named color format */
  strokeColor: string;
  /** Stroke width in pixels (0.5 - 100) */
  strokeWidth: number;
}

/**
 * Context provided to tools for interacting with the canvas
 */
export interface ToolContext {
  /** Add a new object to the canvas */
  addObject: (object: CanvasObject) => void;
  /** Delete objects from the canvas */
  deleteObjects: (ids: string[]) => void;
  /** Select specific objects */
  selectObjects: (ids: string[]) => void;
  /** Add objects to current selection */
  addToSelection: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** All objects currently on the canvas */
  objects: Record<string, CanvasObject>;
  /** Current selection state */
  selection: SelectionState;
  /** Optional callback for selection changes */
  onSelectionChange?: (items: paper.Item[]) => void;
}

/**
 * Represents an object on the canvas
 */
export interface CanvasObject {
  /** Unique identifier */
  id: string;
  /** Paper.js item reference */
  paperItem: paper.Item;
  /** Type of the object */
  type: 'shape' | 'text' | 'path' | 'group';
  /** Whether the object is locked for editing */
  locked: boolean;
  /** Whether the object is visible */
  visible: boolean;
  /** Display name of the object */
  name?: string;
  /** Parent group ID if grouped */
  parentGroup?: string;
}

/**
 * Represents the current selection state
 */
export interface SelectionState {
  /** IDs of selected objects */
  selectedIds: string[];
  /** Whether selection is in progress */
  isSelecting: boolean;
  /** Bounding box of selection */
  selectionBounds?: paper.Rectangle;
  /** Current transform mode */
  transformMode: 'move' | 'resize' | 'rotate' | null;
}

/**
 * Shape creation options
 */
export interface ShapeOptions {
  /** Fill color */
  fillColor?: string;
  /** Stroke color */
  strokeColor?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Number of sides for polygons */
  sides?: number;
  /** Number of points for stars */
  points?: number;
  /** Inner radius for stars */
  innerRadius?: number;
  /** Corner radius for rounded shapes */
  cornerRadius?: number;
}

/**
 * Shape definition for the shape registry
 */
export interface ShapeDefinition {
  /** Unique shape ID */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon identifier */
  icon?: string;
  /** Shape category */
  category: 'basic' | 'polygon' | 'custom';
  /** Function to create the shape */
  createShape: (from: paper.Point, to: paper.Point, options?: ShapeOptions) => paper.Item;
}

/**
 * Command for undo/redo functionality
 */
export interface Command {
  /** Execute the command */
  execute(): void;
  /** Undo the command */
  undo(): void;
  /** Redo the command */
  redo(): void;
  /** Human-readable description */
  description: string;
}

/**
 * Project save format
 */
export interface Project {
  /** Project version */
  version: string;
  /** Project name */
  name: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last modified timestamp */
  modifiedAt: Date;
  /** Canvas data in JSON format */
  canvasData: string;
  /** Project metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: 'svg' | 'png' | 'jpg' | 'json';
  /** Image quality for raster formats (0-1) */
  quality?: number;
  /** Scale factor for export */
  scale?: number;
  /** Background color */
  backgroundColor?: string;
}
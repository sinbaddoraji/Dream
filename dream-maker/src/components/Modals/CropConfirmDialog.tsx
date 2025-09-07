import { useTheme } from '../../hooks/useTheme';

interface CropConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  objectCount: number;
  keptObjectCount: number;
  cropWidth: number;
  cropHeight: number;
}

export function CropConfirmDialog({ isOpen, onConfirm, onCancel, objectCount, keptObjectCount, cropWidth, cropHeight }: CropConfirmDialogProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        style={{
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary
        }}
      >
        <h3 className="text-lg font-semibold mb-4">Confirm Crop Operation</h3>
        
        <div className="space-y-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded" style={{ backgroundColor: theme.colors.background.secondary }}>
            <p className="text-sm font-medium mb-1" style={{ color: theme.colors.text.primary }}>
              Crop Area: {Math.round(cropWidth)} × {Math.round(cropHeight)} pixels
            </p>
            <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
              The canvas will be resized to this dimension
            </p>
          </div>
          
          <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
            <div className="flex justify-between">
              <span>Objects to keep:</span>
              <span className="font-medium text-green-600">{keptObjectCount}</span>
            </div>
            {objectCount > 0 && (
              <div className="flex justify-between">
                <span>Objects to remove:</span>
                <span className="font-medium text-red-600">{objectCount}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
            This action cannot be undone.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border hover:bg-gray-50 transition-colors"
            style={{
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.secondary
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

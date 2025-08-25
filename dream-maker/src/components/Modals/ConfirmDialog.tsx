import { useTheme } from '../../hooks/useTheme'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const { theme } = useTheme()

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div 
        className="rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
        style={{ 
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: theme.colors.text.primary }}
        >
          {title}
        </h3>
        <p 
          className="mb-6"
          style={{ color: theme.colors.text.secondary }}
        >
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded transition-colors hover:bg-gray-200"
            style={{ 
              color: theme.colors.text.secondary,
              borderColor: theme.colors.border.primary 
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
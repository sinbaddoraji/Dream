import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'

interface SaveAsDialogProps {
  isOpen: boolean
  currentName: string
  onSave: (name: string) => void
  onCancel: () => void
}

export function SaveAsDialog({ isOpen, currentName, onSave, onCancel }: SaveAsDialogProps) {
  const { theme } = useTheme()
  const [name, setName] = useState(currentName)

  if (!isOpen) return null

  const handleSave = () => {
    const trimmedName = name.trim()
    if (trimmedName) {
      onSave(trimmedName)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

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
          Save Project As
        </h3>
        
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: theme.colors.text.secondary }}
          >
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter project name..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ 
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.primary,
              color: theme.colors.text.primary 
            }}
            autoFocus
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded transition-colors hover:bg-gray-200"
            style={{ 
              color: theme.colors.text.secondary,
              borderColor: theme.colors.border.primary 
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
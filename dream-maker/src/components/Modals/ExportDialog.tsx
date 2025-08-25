import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'

interface ExportDialogProps {
  isOpen: boolean
  onExport: (format: 'png' | 'jpg' | 'svg' | 'json') => void
  onCancel: () => void
}

export function ExportDialog({ isOpen, onExport, onCancel }: ExportDialogProps) {
  const { theme } = useTheme()
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'svg' | 'json'>('png')

  if (!isOpen) return null

  const formats = [
    { value: 'png' as const, label: 'PNG Image', description: 'Best for web and digital use' },
    { value: 'jpg' as const, label: 'JPEG Image', description: 'Smaller file size, good for photos' },
    { value: 'svg' as const, label: 'SVG Vector', description: 'Scalable vector format' },
    { value: 'json' as const, label: 'Project File', description: 'Save as editable project' },
  ]

  const handleExport = () => {
    onExport(selectedFormat)
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
          Export Project
        </h3>
        
        <div className="space-y-3 mb-6">
          {formats.map((format) => (
            <label 
              key={format.value}
              className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-opacity-10 hover:bg-gray-500"
            >
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={selectedFormat === format.value}
                onChange={(e) => setSelectedFormat(e.target.value as 'png' | 'jpg' | 'svg' | 'json')}
                className="mt-1"
              />
              <div>
                <div 
                  className="font-medium"
                  style={{ color: theme.colors.text.primary }}
                >
                  {format.label}
                </div>
                <div 
                  className="text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {format.description}
                </div>
              </div>
            </label>
          ))}
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
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}
import { useState, useRef, useEffect } from 'react'
import { PanelRight } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useUIStore } from '../store/uiStore'
import { useDesignStore } from '../store/designStore'
import { FileService } from '../services/FileService'
import { ThemeSwitcher } from './ThemeSwitcher'
import { ConfirmDialog, ExportDialog, SaveAsDialog } from './Modals'

export function MenuBar() {
  const { theme } = useTheme()
  const { rightSidebar, setRightSidebarVisible } = useUIStore()
  const { 
    projectName, 
    hasUnsavedChanges,
    newProject, 
    loadProject, 
    saveProject, 
    saveProjectAs, 
    exportProject,
    zoomIn,
    zoomOut,
    zoomToFit
  } = useDesignStore()
  
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
  // Dialog states
  const [showNewConfirm, setShowNewConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)

  // File operation handlers
  const handleNew = () => {
    if (hasUnsavedChanges) {
      setShowNewConfirm(true)
    } else {
      newProject()
    }
  }

  const handleOpen = async () => {
    try {
      const projectData = await FileService.loadProjectFromFile()
      loadProject(projectData)
    } catch (error) {
      console.error('Failed to open project:', error)
      // Could show error toast here
    }
  }

  const handleSave = () => {
    try {
      saveProject()
    } catch (error) {
      console.error('Failed to save project:', error)
      // Could show error toast here
    }
  }

  const handleSaveAs = () => {
    setShowSaveAsDialog(true)
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleExit = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true)
    } else {
      // In a real app, this would close the window
      console.log('Exiting application')
    }
  }

  const menus = [
    {
      name: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: handleNew },
        { label: 'Open...', shortcut: 'Ctrl+O', action: handleOpen },
        { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
        { type: 'separator' as const },
        { label: 'Export...', action: handleExport },
        { type: 'separator' as const },
        { label: 'Exit', shortcut: 'Ctrl+Q', action: handleExit }
      ]
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => console.log('Undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => console.log('Redo') },
        { type: 'separator' as const },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => console.log('Cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => console.log('Copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => console.log('Paste') },
        { label: 'Delete', shortcut: 'Delete', action: () => console.log('Delete') },
        { type: 'separator' as const },
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => console.log('Select All') }
      ]
    },
    {
      name: 'View',
      items: [
        { label: 'Zoom In', shortcut: 'Ctrl++', action: zoomIn },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: zoomOut },
        { label: 'Zoom to Fit', shortcut: 'Ctrl+0', action: zoomToFit },
        { type: 'separator' as const },
        { label: 'Show Grid', action: () => console.log('Show Grid') },
        { label: 'Show Rulers', action: () => console.log('Show Rulers') },
        { type: 'separator' as const },
        { label: 'Fullscreen', shortcut: 'F11', action: () => console.log('Fullscreen') }
      ]
    },
    {
      name: 'Help',
      items: [
        { label: 'Documentation', action: () => console.log('Documentation') },
        { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+/', action: () => console.log('Keyboard Shortcuts') },
        { type: 'separator' as const },
        { label: 'About', action: () => console.log('About') }
      ]
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu) {
        const menuElement = menuRefs.current[openMenu]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenu(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenu])

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName)
  }

  const handleMenuItemClick = (action: () => void) => {
    action()
    setOpenMenu(null)
  }

  return (
    <div 
      className="flex items-center justify-between h-12 px-4 text-sm border-b"
      style={{ 
        backgroundColor: theme.colors.background.secondary,
        borderBottomColor: theme.colors.border.primary,
        color: theme.colors.text.primary
      }}
    >
      <div className="flex items-center">
        {menus.map((menu) => (
        <div
          key={menu.name}
          className="relative"
          ref={(el) => { menuRefs.current[menu.name] = el }}
        >
          <button
            className="px-3 py-1 rounded hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            onClick={() => handleMenuClick(menu.name)}
            style={{
              backgroundColor: openMenu === menu.name ? theme.colors.background.tertiary : 'transparent'
            }}
          >
            {menu.name}
          </button>
          
          {openMenu === menu.name && (
            <div
              className="absolute top-full left-0 mt-1 py-1 min-w-48 rounded shadow-lg border z-50"
              style={{
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.primary
              }}
            >
              {menu.items.map((item, index) => (
                item.type === 'separator' ? (
                  <div
                    key={index}
                    className="h-px my-1 mx-2"
                    style={{ backgroundColor: theme.colors.border.primary }}
                  />
                ) : (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-opacity-10 hover:bg-gray-500 transition-colors flex justify-between items-center"
                    onClick={() => item.action && handleMenuItemClick(item.action)}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span
                        className="text-xs opacity-60"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                )
              ))}
            </div>
          )}
        </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setRightSidebarVisible(!rightSidebar.isVisible)}
          className={`p-2 rounded transition-colors ${
            rightSidebar.isVisible ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          }`}
          title="Toggle Favorites Sidebar"
        >
          <PanelRight size={16} />
        </button>
        <ThemeSwitcher />
      </div>
      
      {/* Modals */}
      <ConfirmDialog
        isOpen={showNewConfirm}
        title="New Project"
        message={`You have unsaved changes. Creating a new project will lose these changes. Continue?`}
        confirmText="Create New"
        onConfirm={() => {
          newProject()
          setShowNewConfirm(false)
        }}
        onCancel={() => setShowNewConfirm(false)}
      />
      
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Exit Application"
        message="You have unsaved changes. Exit without saving?"
        confirmText="Exit"
        onConfirm={() => {
          setShowExitConfirm(false)
          console.log('Exiting application')
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
      
      <ExportDialog
        isOpen={showExportDialog}
        onExport={(format) => {
          try {
            exportProject(format)
            setShowExportDialog(false)
          } catch (error) {
            console.error('Export failed:', error)
            // Could show error toast here
          }
        }}
        onCancel={() => setShowExportDialog(false)}
      />
      
      <SaveAsDialog
        isOpen={showSaveAsDialog}
        currentName={projectName}
        onSave={(name) => {
          try {
            saveProjectAs(name)
            setShowSaveAsDialog(false)
          } catch (error) {
            console.error('Save As failed:', error)
            // Could show error toast here
          }
        }}
        onCancel={() => setShowSaveAsDialog(false)}
      />
    </div>
  )
}
import { useState, useRef, useEffect } from 'react'
import { PanelRight } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useUIStore } from '../store/uiStore'
import { ThemeSwitcher } from './ThemeSwitcher'

export function MenuBar() {
  const { theme } = useTheme()
  const { rightSidebar, setRightSidebarVisible } = useUIStore()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const menus = [
    {
      name: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', action: () => console.log('New') },
        { label: 'Open...', shortcut: 'Ctrl+O', action: () => console.log('Open') },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => console.log('Save') },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: () => console.log('Save As') },
        { type: 'separator' as const },
        { label: 'Export...', action: () => console.log('Export') },
        { type: 'separator' as const },
        { label: 'Exit', shortcut: 'Ctrl+Q', action: () => console.log('Exit') }
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
        { label: 'Zoom In', shortcut: 'Ctrl++', action: () => console.log('Zoom In') },
        { label: 'Zoom Out', shortcut: 'Ctrl+-', action: () => console.log('Zoom Out') },
        { label: 'Zoom to Fit', shortcut: 'Ctrl+0', action: () => console.log('Zoom to Fit') },
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
    </div>
  )
}
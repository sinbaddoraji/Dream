import { useState } from 'react';
import { Layers, ChevronLeft } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useTheme } from '../hooks/useTheme';
import { ObjectLayersPanel } from './Panels/ObjectLayersPanel';

export function LeftSidebar() {
  const { leftSidebar, setLeftSidebarVisible } = useUIStore();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'layers'>('layers');

  if (!leftSidebar.isVisible) return null;

  const tabs = [
    { id: 'layers', label: 'Layers', icon: Layers, component: ObjectLayersPanel }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ObjectLayersPanel;

  return (
    <div 
      className="fixed left-0 top-12 z-30 w-64 h-[calc(100vh-72px)] flex flex-col"
      style={{ 
        backgroundColor: theme.colors.toolbar.background,
        borderRight: `1px solid ${theme.colors.border.primary}`,
        boxShadow: '4px 0 12px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header with tabs */}
      <div 
        className="flex items-center justify-between border-b"
        style={{ borderColor: theme.colors.border.primary }}
      >
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'layers')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500'
                  : 'hover:bg-gray-100'
              }`}
              style={{ 
                color: activeTab === tab.id 
                  ? theme.colors.text.primary 
                  : theme.colors.text.secondary 
              }}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setLeftSidebarVisible(false)}
          className="p-2 rounded hover:bg-gray-200 transition-colors mr-1"
          title="Close sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <ActiveComponent />
      </div>
    </div>
  );
}
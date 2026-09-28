import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  badge?: string;
  onClick?: () => void;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  activeId,
  onSelect,
  className = '',
}) => {
  return (
    <aside className={`w-full flex flex-col gap-6 text-xs select-none ${className}`}>
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          {section.title && (
            <h4 className="px-2.5 py-1 text-[11px] font-medium text-[#737373] uppercase tracking-wider">
              {section.title}
            </h4>
          )}
          <nav className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = item.id === activeId;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick ? item.onClick() : onSelect(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium text-xs transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#1C1C1C] text-[#FFFFFF] font-semibold'
                      : 'text-[#A3A3A3] hover:text-[#FFFFFF] hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {Icon && (
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#FFFFFF]' : 'text-[#737373]'
                        }`}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#262626] text-[#A3A3A3]">
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && (
                      <span className="font-mono text-[10px] text-[#525252] tabular-nums">
                        {item.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
};

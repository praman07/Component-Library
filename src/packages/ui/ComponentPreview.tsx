import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { PreviewStateItem } from '../types';

export interface ComponentPreviewProps {
  states: PreviewStateItem[];
  renderComponent: (props: Record<string, any>, stateId: string) => React.ReactNode;
  className?: string;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  states,
  renderComponent,
  className = '',
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(
    states.length > 0 ? states[0].id : 'default'
  );
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const [resetKey, setResetKey] = useState(0);

  const currentState = states.find((s) => s.id === selectedStateId) || states[0];

  return (
    <div className={`border border-[#262626] rounded-md bg-[#0D0D0D] overflow-hidden flex flex-col ${className}`}>
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-[#121212] border-b border-[#1E1E1E] text-xs">
        {/* State selection pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-[11px] font-medium text-[#737373] mr-1 uppercase tracking-wider">
            State:
          </span>
          {states.map((st) => {
            const isSelected = st.id === selectedStateId;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStateId(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#262626] text-[#FFFFFF]'
                    : 'text-[#8A8A8A] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
                }`}
              >
                {st.name}
              </button>
            );
          })}
        </div>

        {/* Viewport switchers & Reset */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewportWidth('100%')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportWidth === '100%'
                ? 'bg-[#262626] text-[#FFFFFF]'
                : 'text-[#737373] hover:text-[#FFFFFF]'
            }`}
            title="Desktop View (100%)"
            aria-label="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewportWidth('768px')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportWidth === '768px'
                ? 'bg-[#262626] text-[#FFFFFF]'
                : 'text-[#737373] hover:text-[#FFFFFF]'
            }`}
            title="Tablet View (768px)"
            aria-label="Tablet View"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewportWidth('375px')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewportWidth === '375px'
                ? 'bg-[#262626] text-[#FFFFFF]'
                : 'text-[#737373] hover:text-[#FFFFFF]'
            }`}
            title="Mobile View (375px)"
            aria-label="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-[#262626] mx-1" />
          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            className="p-1.5 text-[#737373] hover:text-[#FFFFFF] rounded transition-colors cursor-pointer"
            title="Reset Component State"
            aria-label="Reset Component State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* State description */}
      {currentState && (
        <div className="px-4 py-1.5 bg-[#0F0F0F] border-b border-[#1A1A1A] text-[11px] text-[#737373]">
          {currentState.description}
        </div>
      )}

      {/* Render Canvas */}
      <div className="flex-1 p-6 sm:p-12 flex items-center justify-center overflow-x-auto min-h-[260px] bg-[#0A0A0A]">
        <div
          key={resetKey}
          style={{ width: viewportWidth, maxWidth: '100%' }}
          className="transition-all duration-200 flex items-center justify-center"
        >
          {currentState && renderComponent(currentState.props, currentState.id)}
        </div>
      </div>
    </div>
  );
};

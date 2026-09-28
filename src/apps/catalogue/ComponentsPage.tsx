import React, { useState } from 'react';
import { ComponentSummary, AccessLevel } from '../../packages/types';
import { SearchInput, StatusBadge, Sidebar, EmptyState } from '../../packages/ui';
import { ArrowRight, Layers, ShieldCheck, Lock, Box, Grid } from 'lucide-react';

export interface ComponentsPageProps {
  components: ComponentSummary[];
  onSelectComponent: (slug: string) => void;
}

export const ComponentsPage: React.FC<ComponentsPageProps> = ({
  components,
  onSelectComponent,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Build sidebar sections
  const freeCount = components.filter((c) => c.accessLevel === 'FREE').length;
  const premiumCount = components.filter((c) => c.accessLevel === 'PREMIUM').length;

  const sidebarSections = [
    {
      title: 'Filter By Access',
      items: [
        { id: 'all', label: 'All Components', count: components.length, icon: Layers },
        { id: 'free', label: 'Free Tier', count: freeCount, icon: ShieldCheck },
        { id: 'premium', label: 'Premium Tier', count: premiumCount, icon: Lock },
      ],
    },
    {
      title: 'Categories',
      items: [
        { id: 'cat-primitives', label: 'Primitives', count: components.filter((c) => c.category === 'primitives').length, icon: Box },
        { id: 'cat-forms', label: 'Forms', count: components.filter((c) => c.category === 'forms').length, icon: Grid },
        { id: 'cat-data-display', label: 'Data Display', count: components.filter((c) => c.category === 'data-display').length, icon: Grid },
        { id: 'cat-navigation', label: 'Navigation', count: components.filter((c) => c.category === 'navigation').length, icon: Grid },
        { id: 'cat-overlays', label: 'Overlays', count: components.filter((c) => c.category === 'overlays').length, icon: Grid },
      ],
    },
  ];

  const filteredComponents = components.filter((comp) => {
    // Access level filter
    if (selectedFilter === 'free' && comp.accessLevel !== 'FREE') return false;
    if (selectedFilter === 'premium' && comp.accessLevel !== 'PREMIUM') return false;

    // Category filter
    if (selectedFilter.startsWith('cat-')) {
      const cat = selectedFilter.replace('cat-', '');
      if (comp.category !== cat) return false;
    }

    // Search query
    if (search) {
      const q = search.toLowerCase();
      const matchName = comp.name.toLowerCase().includes(q);
      const matchDesc = comp.description.toLowerCase().includes(q);
      const matchCat = comp.category.toLowerCase().includes(q);
      const matchSlug = comp.slug.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat && !matchSlug) return false;
    }

    return true;
  });

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 pb-16">
      {/* Left Sidebar */}
      <aside className="w-full md:w-56 shrink-0">
        <Sidebar
          sections={sidebarSections}
          activeId={selectedFilter}
          onSelect={setSelectedFilter}
        />
      </aside>

      {/* Main Listing View */}
      <main className="flex-1 min-w-0 space-y-6">
        {/* Search & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E1E1E]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">Components</h1>
            <p className="text-xs text-[#8A8A8A] mt-0.5">
              Explore reusable React primitives and composite layouts.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search components ( / )..."
            />
          </div>
        </div>

        {/* Results */}
        {filteredComponents.length === 0 ? (
          <EmptyState
            title="No matching components found"
            description="Try adjusting your search query or switching the category filter."
            actionLabel="Reset filters"
            onAction={() => {
              setSelectedFilter('all');
              setSearch('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComponents.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onSelectComponent(comp.slug)}
                className="p-5 rounded-md border border-[#222222] bg-[#111111] hover:border-[#383838] hover:bg-[#141414] transition-colors cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                      {comp.category}
                    </span>
                    <StatusBadge accessLevel={comp.accessLevel} />
                  </div>

                  <h3 className="text-sm font-semibold text-[#FFFFFF] group-hover:text-[#FFFFFF] transition-colors flex items-center justify-between">
                    <span>{comp.name}</span>
                    <span className="font-mono text-xs text-[#525252] font-normal">v{comp.version}</span>
                  </h3>

                  <p className="text-xs text-[#8A8A8A] mt-2 line-clamp-3 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] text-[#737373]">
                  <span>
                    {comp.filesCount} file{comp.filesCount === 1 ? '' : 's'} · {comp.dependenciesCount} deps
                  </span>
                  <span className="group-hover:text-[#FFFFFF] transition-colors flex items-center gap-1 font-medium">
                    Documentation <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

import React from 'react';
import SidebarContent from './SidebarContent';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 hidden md:block">
      <SidebarContent />
    </aside>
  );
}

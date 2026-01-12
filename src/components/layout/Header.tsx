// ============================================
// Header Component
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSelectedProject, useRole } from '@/hooks';
import { Select, Button, RoleBadge } from '@/components';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, selectedProjectId, selectProject } = useSelectedProject();
  const { role, isDemo } = useRole();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = parseInt(e.target.value);
    selectProject(projectId || null);
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="text-gray-500 hover:text-gray-600 lg:hidden"
            onClick={onMenuClick}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Project Selector */}
          <div className="hidden sm:block">
            <Select
              value={selectedProjectId?.toString() ?? ''}
              onChange={handleProjectChange}
              options={[
                { value: '', label: 'All Projects' },
                ...projects.map((p) => ({
                  value: p.id,
                  label: p.name,
                })),
              ]}
              className="w-48"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Demo Mode Badge */}
          {isDemo && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
              Demo Mode
            </span>
          )}

          {/* Notifications */}
          <button
            type="button"
            className="relative text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <RoleBadge role={role ?? 'USER'} />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Project Selector */}
      <div className="border-t border-gray-200 px-4 py-2 sm:hidden">
        <Select
          value={selectedProjectId?.toString() ?? ''}
          onChange={handleProjectChange}
          options={[
            { value: '', label: 'All Projects' },
            ...(projects ?? []).map((p) => ({
              value: p.id,
              label: p.name,
            })),
          ]}
          className="w-full"
        />
      </div>
    </header>
  );
};

export default Header;

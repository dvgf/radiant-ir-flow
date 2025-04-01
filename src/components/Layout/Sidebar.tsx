
import { NavLink } from 'react-router-dom';
import { UserRole } from '@/types';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  Settings, 
  Activity, 
  Calendar, 
  FileQuestion,
  TagsIcon,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  userRole: UserRole;
}

export const Sidebar = ({ collapsed, userRole }: SidebarProps) => {
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const toggleTemplates = () => {
    setTemplatesOpen(!templatesOpen);
  };

  return (
    <aside
      className={`bg-ir-muted border-r border-ir-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-center h-16 border-b border-ir-border">
        {collapsed ? (
          <span className="text-2xl font-bold text-ir-primary">IR</span>
        ) : (
          <h1 className="text-xl font-bold text-ir-foreground">IR Workflow</h1>
        )}
      </div>

      <nav className="mt-4 px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `ir-sidebar-item ${isActive ? 'active' : ''} ${
              collapsed ? 'justify-center' : ''
            } mb-1`
          }
        >
          <Activity className="h-5 w-5" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/worklist"
          className={({ isActive }) =>
            `ir-sidebar-item ${isActive ? 'active' : ''} ${
              collapsed ? 'justify-center' : ''
            } mb-1`
          }
        >
          <ClipboardList className="h-5 w-5" />
          {!collapsed && <span>Worklist</span>}
        </NavLink>

        {userRole === 'technologist' && (
          <NavLink
            to="/tech-status"
            className={({ isActive }) =>
              `ir-sidebar-item ${isActive ? 'active' : ''} ${
                collapsed ? 'justify-center' : ''
              } mb-1`
            }
          >
            <Activity className="h-5 w-5" />
            {!collapsed && <span>Tech Status</span>}
          </NavLink>
        )}

        {userRole === 'doctor' && (
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `ir-sidebar-item ${isActive ? 'active' : ''} ${
                collapsed ? 'justify-center' : ''
              } mb-1`
            }
          >
            <FileText className="h-5 w-5" />
            {!collapsed && <span>Reports</span>}
          </NavLink>
        )}

        <NavLink
          to="/schedule"
          className={({ isActive }) =>
            `ir-sidebar-item ${isActive ? 'active' : ''} ${
              collapsed ? 'justify-center' : ''
            } mb-1`
          }
        >
          <Calendar className="h-5 w-5" />
          {!collapsed && <span>Schedule</span>}
        </NavLink>

        {userRole === 'admin' && (
          <>
            <div className={`mt-4 mb-2 ${collapsed ? 'text-center' : ''}`}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-ir-foreground/60 uppercase tracking-wider">
                  Admin
                </h3>
              )}
            </div>

            {!collapsed ? (
              <div className="mb-1">
                <button 
                  onClick={toggleTemplates}
                  className="ir-sidebar-item w-full flex justify-between"
                >
                  <div className="flex items-center">
                    <FileQuestion className="h-5 w-5 mr-2" />
                    <span>Templates</span>
                  </div>
                  {templatesOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {templatesOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <NavLink
                      to="/templates"
                      className={({ isActive }) =>
                        `ir-sidebar-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <FileText className="h-4 w-4" />
                      <span>Template Editor</span>
                    </NavLink>
                    <NavLink
                      to="/template-codes"
                      className={({ isActive }) =>
                        `ir-sidebar-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <TagsIcon className="h-4 w-4" />
                      <span>Billing Codes</span>
                    </NavLink>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/templates"
                className={({ isActive }) =>
                  `ir-sidebar-item ${isActive ? 'active' : ''} ${
                    collapsed ? 'justify-center' : ''
                  } mb-1`
                }
              >
                <FileQuestion className="h-5 w-5" />
              </NavLink>
            )}

            <NavLink
              to="/providers"
              className={({ isActive }) =>
                `ir-sidebar-item ${isActive ? 'active' : ''} ${
                  collapsed ? 'justify-center' : ''
                } mb-1`
              }
            >
              <Users className="h-5 w-5" />
              {!collapsed && <span>Providers</span>}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `ir-sidebar-item ${isActive ? 'active' : ''} ${
                  collapsed ? 'justify-center' : ''
                } mb-1`
              }
            >
              <Settings className="h-5 w-5" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};

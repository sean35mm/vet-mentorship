import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Home,
  Search,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  Star,
  Clock,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: number;
  active?: boolean;
}

interface SidebarProps {
  items?: SidebarItem[] | undefined;
  collapsed?: boolean | undefined;
  onToggleCollapse?: (() => void) | undefined;
  onItemClick?: ((item: SidebarItem) => void) | undefined;
  className?: string | undefined;
}

const defaultItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true,
  },
  {
    id: 'search',
    label: 'Find Mentors',
    icon: Search,
    href: '/search',
  },
  {
    id: 'sessions',
    label: 'My Sessions',
    icon: Calendar,
    href: '/sessions',
    badge: 2,
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: MessageSquare,
    href: '/requests',
    badge: 5,
  },
  {
    id: 'mentees',
    label: 'My Mentees',
    icon: Users,
    href: '/mentees',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: Star,
    href: '/reviews',
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Clock,
    href: '/availability',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  items = defaultItems,
  collapsed = false,
  onToggleCollapse,
  onItemClick,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col h-full bg-papaya_whip-500 border-r border-air_superiority_blue-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-air_superiority_blue-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fire_brick-500 text-papaya_whip-500 font-bold">
              M
            </div>
            <span className="font-bold text-prussian_blue-500">MVT</span>
          </div>
        )}
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              'h-8 w-8 text-prussian_blue-500 hover:bg-air_superiority_blue-100 hover:text-fire_brick-500',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-prussian_blue-500 hover:bg-air_superiority_blue-100 hover:text-fire_brick-500',
                'focus:bg-air_superiority_blue-100 focus:text-fire_brick-500 focus:outline-none',
                item.active && 'bg-fire_brick-500 text-papaya_whip-500',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn(
                'h-4 w-4 flex-shrink-0',
                !collapsed && 'mr-3',
                item.active ? 'text-papaya_whip-500' : 'text-prussian_blue-400'
              )} />
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-auto h-5 w-5 rounded-full p-0 text-xs bg-fire_brick-500 text-papaya_whip-500 hover:bg-fire_brick-600"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </>
              )}
              
              {collapsed && item.badge && item.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs bg-fire_brick-500 text-papaya_whip-500"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-air_superiority_blue-200">
          <div className="rounded-lg bg-air_superiority_blue-50 p-3">
            <h4 className="text-sm font-medium text-prussian_blue-500">Need Help?</h4>
            <p className="text-xs text-prussian_blue-400 mt-1">
              Check out our help center for guides and support.
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-full border-fire_brick-500 text-fire_brick-500 hover:bg-fire_brick-500 hover:text-papaya_whip-500">
              Help Center
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile sidebar overlay
interface MobileSidebarProps extends SidebarProps {
  open: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  open,
  onClose,
  ...sidebarProps
}) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
    
    return undefined;
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
        <Sidebar
          {...sidebarProps}
          className="h-full"
          onItemClick={(item) => {
            sidebarProps.onItemClick?.(item);
            onClose();
          }}
        />
      </div>
    </>
  );
};

export { Sidebar, MobileSidebar, type SidebarItem };
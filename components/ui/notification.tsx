import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { 
  Bell,
  X,
  Check,
  Clock,
  MessageSquare,
  Calendar,
  Star,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'request' | 'session' | 'review' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  actions?: {
    primary?: { label: string; action: () => void };
    secondary?: { label: string; action: () => void };
  };
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    sessionId?: string;
    requestId?: string;
    reviewId?: string;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  compact = false,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'request':
        return <MessageSquare className="h-4 w-4" />;
      case 'session':
        return <Calendar className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'request':
        return 'text-blue-600';
      case 'session':
        return 'text-green-600';
      case 'review':
        return 'text-yellow-600';
      case 'system':
        return 'text-purple-600';
      case 'reminder':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 border-b hover:bg-muted/50 transition-colors',
        !notification.read && 'bg-primary/5 border-l-4 border-l-primary',
        compact && 'p-3'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-1', getTypeColor())}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* User Avatar and Name */}
            {notification.user && !compact && (
              <div className="flex items-center space-x-2 mb-1">
                <Avatar className="h-6 w-6">
                  {notification.user.avatar && <AvatarImage src={notification.user.avatar} />}
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{notification.user.name}</span>
              </div>
            )}
            
            {/* Title */}
            <h4 className={cn(
              'font-medium',
              compact ? 'text-sm' : 'text-base',
              !notification.read && 'text-foreground',
              notification.read && 'text-muted-foreground'
            )}>
              {notification.title}
            </h4>
            
            {/* Message */}
            <p className={cn(
              'text-muted-foreground mt-1',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {notification.message}
            </p>
            
            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-2">
              {formatTimestamp(notification.timestamp)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {!notification.read && (
              <Button
                variant="ghost"
                
                onClick={() => onMarkAsRead?.(notification.id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              
              onClick={() => onDelete?.(notification.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        {notification.actionable && notification.actions && !compact && (
          <div className="flex space-x-2 mt-3">
            {notification.actions.secondary && (
              <Button
                variant="outline"
                
                onClick={notification.actions.secondary.action}
              >
                {notification.actions.secondary.label}
              </Button>
            )}
            {notification.actions.primary && (
              <Button
                
                onClick={notification.actions.primary.action}
              >
                {notification.actions.primary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onViewAll?: () => void;
  maxItems?: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
  maxItems = 5,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = notifications.slice(0, maxItems);

  return (
    <div className="w-80 bg-background border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" >
              {unreadCount} new
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
              compact
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > maxItems && (
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            
            onClick={onViewAll}
            className="w-full"
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewAll,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50">
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onDelete={onDelete}
            onViewAll={() => {
              onViewAll?.();
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastIcon = () => {
    switch (notification.type) {
      case 'request':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'session':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'system':
        return <Info className="h-4 w-4 text-purple-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 bg-background border rounded-lg shadow-lg max-w-sm">
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        {notification.actionable && notification.actions && (
          <div className="flex space-x-2 mt-2">
            {notification.actions.secondary && (
              <Button
                variant="outline"
                
                onClick={notification.actions.secondary.action}
                className="text-xs"
              >
                {notification.actions.secondary.label}
              </Button>
            )}
            {notification.actions.primary && (
              <Button
                
                onClick={notification.actions.primary.action}
                className="text-xs"
              >
                {notification.actions.primary.label}
              </Button>
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        
        onClick={onClose}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export {
  NotificationItem,
  NotificationDropdown,
  NotificationBell,
  NotificationToast,
  type NotificationItemProps,
  type NotificationDropdownProps,
  type NotificationBellProps,
  type NotificationToastProps,
};

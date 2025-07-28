'use client';

import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { NotificationItem, type Notification } from '../../components/ui/notification';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useNotifications } from '../../lib/contexts/notification-context';
import { 
  Bell,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Settings,
  Archive,
  MoreHorizontal
} from 'lucide-react';

// Mock user data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = React.useState<string[]>([]);

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === filterType);
      }
    }

    return filtered;
  }, [notifications, searchQuery, filterType]);

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  const notificationTypes = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'request', label: 'Requests', count: notifications.filter(n => n.type === 'request').length },
    { value: 'session', label: 'Sessions', count: notifications.filter(n => n.type === 'session').length },
    { value: 'review', label: 'Reviews', count: notifications.filter(n => n.type === 'review').length },
    { value: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
  ];

  return (
    <DashboardLayout
      title="Notifications"
      description="Stay updated with your mentorship activities"
      user={mockUser}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button  onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters and Search */}
        <Card className="bg-papaya_whip-500 border-air_superiority_blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-prussian_blue-400" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-papaya_whip-500 border-air_superiority_blue-200 text-prussian_blue-500 placeholder:text-prussian_blue-400"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                {notificationTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={filterType === type.value ? "default" : "outline"}
                    onClick={() => setFilterType(type.value)}
                    className={`flex items-center gap-2 ${
                      filterType === type.value 
                        ? "bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500" 
                        : "border-air_superiority_blue-200 text-prussian_blue-500 hover:bg-fire_brick-50 hover:text-fire_brick-600"
                    }`}
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge variant="secondary" className="bg-air_superiority_blue-100 text-prussian_blue-500">
                        {type.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
        <Card className="bg-papaya_whip-500 border-air_superiority_blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-prussian_blue-500">
                  {selectedNotifications.length} selected
                </span>
                <Button variant="outline" onClick={handleSelectAll} className="border-air_superiority_blue-200 text-prussian_blue-500 hover:bg-fire_brick-50 hover:text-fire_brick-600">
                  {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBulkMarkAsRead} className="border-air_superiority_blue-200 text-prussian_blue-500 hover:bg-fire_brick-50 hover:text-fire_brick-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button variant="outline" onClick={handleBulkDelete} className="border-air_superiority_blue-200 text-fire_brick-500 hover:bg-fire_brick-50 hover:text-fire_brick-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>        )}

        {/* Notifications List */}
        <Card className="bg-papaya_whip-500 border-air_superiority_blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-prussian_blue-500">
                  <Bell className="h-5 w-5 text-fire_brick-500" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-prussian_blue-400">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </CardDescription>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  className="text-fire_brick-500 hover:text-fire_brick-600 hover:bg-fire_brick-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-center">
                    <div className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-prussian_blue-400 opacity-50" />
                <h3 className="text-lg font-semibold mb-2 text-prussian_blue-500">No notifications found</h3>
                <p className="text-prussian_blue-400">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'You\'re all caught up! New notifications will appear here.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="bg-papaya_whip-500 border-air_superiority_blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-prussian_blue-500">
              <Settings className="h-5 w-5 text-fire_brick-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-prussian_blue-400">
              Customize how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-prussian_blue-500">Email Notifications</h4>
                <div className="space-y-2">
                  {[
                    { id: 'email-requests', label: 'New mentorship requests', checked: true },
                    { id: 'email-sessions', label: 'Session reminders', checked: true },
                    { id: 'email-reviews', label: 'New reviews', checked: false },
                    { id: 'email-weekly', label: 'Weekly summary', checked: true },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={item.id}
                        defaultChecked={item.checked}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={item.id} className="text-sm">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-prussian_blue-500">Push Notifications</h4>
                <div className="space-y-2">
                  {[
                    { id: 'push-requests', label: 'New mentorship requests', checked: true },
                    { id: 'push-sessions', label: 'Session starting soon', checked: true },
                    { id: 'push-messages', label: 'New messages', checked: true },
                    { id: 'push-reviews', label: 'New reviews', checked: false },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={item.id}
                        defaultChecked={item.checked}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={item.id} className="text-sm">
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-air_superiority_blue-200">
              <Button className="bg-fire_brick-500 hover:bg-fire_brick-600 text-papaya_whip-500">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

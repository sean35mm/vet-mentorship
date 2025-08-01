'use client';

import { Bell, CheckCircle, Search, Settings, Trash2 } from 'lucide-react';
import * as React from 'react';
import { DashboardLayout } from '../../components/layout/layout';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { NotificationItem } from '../../components/ui/notification';
import { useNotifications } from '../../lib/contexts/notification-context';

// Force dynamic rendering since this page requires user context
export const dynamic = 'force-dynamic';

// Mock user data
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: undefined,
  unreadNotifications: 3,
};

export default function NotificationsPage() {
  // Handle case where NotificationProvider might not be available
  let notifications: any[] = [];
  let unreadCount = 0;
  let markAsRead = (_id: string) => {};
  let markAllAsRead = () => {};
  let deleteNotification = (_id: string) => {};
  let clearAll = () => {};

  try {
    const notificationContext = useNotifications();
    notifications = notificationContext.notifications;
    unreadCount = notificationContext.unreadCount;
    markAsRead = notificationContext.markAsRead;
    markAllAsRead = notificationContext.markAllAsRead;
    deleteNotification = notificationContext.deleteNotification;
    clearAll = notificationContext.clearAll;
  } catch (error) {
    // NotificationProvider not available, use defaults
    console.warn('NotificationProvider not available, using defaults');
  }

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = React.useState<
    string[]
  >([]);

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        notification =>
          notification.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.message
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          notification.user?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
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
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
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
    {
      value: 'request',
      label: 'Requests',
      count: notifications.filter(n => n.type === 'request').length,
    },
    {
      value: 'session',
      label: 'Sessions',
      count: notifications.filter(n => n.type === 'session').length,
    },
    {
      value: 'review',
      label: 'Reviews',
      count: notifications.filter(n => n.type === 'review').length,
    },
    {
      value: 'system',
      label: 'System',
      count: notifications.filter(n => n.type === 'system').length,
    },
  ];

  return (
    <DashboardLayout
      title='Notifications'
      description='Stay updated with your mentorship activities'
      user={mockUser}
      actions={
        <div className='flex gap-2'>
          <Button variant='outline'>
            <Settings className='mr-2 h-4 w-4' />
            Preferences
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCircle className='mr-2 h-4 w-4' />
              Mark All Read
            </Button>
          )}
        </div>
      }
    >
      <div className='space-y-6'>
        {/* Filters and Search */}
        <Card className='border-air_superiority_blue-200 bg-papaya_whip-500'>
          <CardContent className='p-4'>
            <div className='flex flex-col gap-4 lg:flex-row'>
              {/* Search */}
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-prussian_blue-400' />
                  <Input
                    placeholder='Search notifications...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='border-air_superiority_blue-200 bg-papaya_whip-500 pl-10 text-prussian_blue-500 placeholder:text-prussian_blue-400'
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className='flex flex-wrap gap-2'>
                {notificationTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={filterType === type.value ? 'default' : 'outline'}
                    onClick={() => setFilterType(type.value)}
                    className={`flex items-center gap-2 ${
                      filterType === type.value
                        ? 'bg-fire_brick-500 text-papaya_whip-500 hover:bg-fire_brick-600'
                        : 'hover:bg-fire_brick-50 border-air_superiority_blue-200 text-prussian_blue-500 hover:text-fire_brick-600'
                    }`}
                  >
                    {type.label}
                    {type.count > 0 && (
                      <Badge
                        variant='secondary'
                        className='bg-air_superiority_blue-100 text-prussian_blue-500'
                      >
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
          <Card className='border-air_superiority_blue-200 bg-papaya_whip-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-prussian_blue-500'>
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    variant='outline'
                    onClick={handleSelectAll}
                    className='hover:bg-fire_brick-50 border-air_superiority_blue-200 text-prussian_blue-500 hover:text-fire_brick-600'
                  >
                    {selectedNotifications.length ===
                    filteredNotifications.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleBulkMarkAsRead}
                    className='hover:bg-fire_brick-50 border-air_superiority_blue-200 text-prussian_blue-500 hover:text-fire_brick-600'
                  >
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Mark as Read
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleBulkDelete}
                    className='hover:bg-fire_brick-50 border-air_superiority_blue-200 text-fire_brick-500 hover:text-fire_brick-600'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card className='border-air_superiority_blue-200 bg-papaya_whip-500'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-prussian_blue-500'>
                  <Bell className='h-5 w-5 text-fire_brick-500' />
                  Notifications
                </CardTitle>
                <CardDescription className='text-prussian_blue-400'>
                  {filteredNotifications.length} notification
                  {filteredNotifications.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </CardDescription>
              </div>
              {notifications.length > 0 && (
                <Button
                  variant='ghost'
                  onClick={clearAll}
                  className='hover:bg-fire_brick-50 text-fire_brick-500 hover:text-fire_brick-600'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {filteredNotifications.length > 0 ? (
              <div className='divide-y'>
                {filteredNotifications.map(notification => (
                  <div key={notification.id} className='flex items-center'>
                    <div className='p-4'>
                      <input
                        type='checkbox'
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={() =>
                          handleSelectNotification(notification.id)
                        }
                        className='rounded border-gray-300'
                      />
                    </div>
                    <div className='flex-1'>
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
              <div className='p-12 text-center'>
                <Bell className='mx-auto mb-4 h-12 w-12 text-prussian_blue-400 opacity-50' />
                <h3 className='mb-2 text-lg font-semibold text-prussian_blue-500'>
                  No notifications found
                </h3>
                <p className='text-prussian_blue-400'>
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className='border-air_superiority_blue-200 bg-papaya_whip-500'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-prussian_blue-500'>
              <Settings className='h-5 w-5 text-fire_brick-500' />
              Notification Preferences
            </CardTitle>
            <CardDescription className='text-prussian_blue-400'>
              Customize how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-3'>
                <h4 className='font-medium text-prussian_blue-500'>
                  Email Notifications
                </h4>
                <div className='space-y-2'>
                  {[
                    {
                      id: 'email-requests',
                      label: 'New mentorship requests',
                      checked: true,
                    },
                    {
                      id: 'email-sessions',
                      label: 'Session reminders',
                      checked: true,
                    },
                    {
                      id: 'email-reviews',
                      label: 'New reviews',
                      checked: false,
                    },
                    {
                      id: 'email-weekly',
                      label: 'Weekly summary',
                      checked: true,
                    },
                  ].map(item => (
                    <div key={item.id} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id={item.id}
                        defaultChecked={item.checked}
                        className='rounded border-gray-300'
                      />
                      <label htmlFor={item.id} className='text-sm'>
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-3'>
                <h4 className='font-medium text-prussian_blue-500'>
                  Push Notifications
                </h4>
                <div className='space-y-2'>
                  {[
                    {
                      id: 'push-requests',
                      label: 'New mentorship requests',
                      checked: true,
                    },
                    {
                      id: 'push-sessions',
                      label: 'Session starting soon',
                      checked: true,
                    },
                    {
                      id: 'push-messages',
                      label: 'New messages',
                      checked: true,
                    },
                    {
                      id: 'push-reviews',
                      label: 'New reviews',
                      checked: false,
                    },
                  ].map(item => (
                    <div key={item.id} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id={item.id}
                        defaultChecked={item.checked}
                        className='rounded border-gray-300'
                      />
                      <label htmlFor={item.id} className='text-sm'>
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className='border-t border-air_superiority_blue-200 pt-4'>
              <Button className='bg-fire_brick-500 text-papaya_whip-500 hover:bg-fire_brick-600'>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

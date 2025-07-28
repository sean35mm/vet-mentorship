import * as React from 'react';
import { cn } from '../../lib/utils';
import { Header } from './header';
import { Sidebar, MobileSidebar, type SidebarItem } from './sidebar';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean | undefined;
  showFooter?: boolean | undefined;
  sidebarItems?: SidebarItem[] | undefined;
  user?: {
    name: string;
    email: string;
    avatar?: string | undefined;
    unreadNotifications?: number | undefined;
  } | undefined;
  onSearch?: ((query: string) => void) | undefined;
  onNotificationClick?: (() => void) | undefined;
  onProfileClick?: (() => void) | undefined;
  onSettingsClick?: (() => void) | undefined;
  onLogoutClick?: (() => void) | undefined;
  className?: string | undefined;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  showFooter = true,
  sidebarItems,
  user,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  className,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const handleSidebarItemClick = (item: SidebarItem) => {
    // Handle navigation - in a real app, you'd use Next.js router
    console.log('Navigate to:', item.href);
  };

  return (
    <div className={cn('min-h-screen bg-papaya_whip-500', className)}>
      {/* Header */}
      <Header
        onMenuClick={() => setMobileSidebarOpen(true)}
        {...(user && { user })}
        onSearch={onSearch}
        onNotificationClick={onNotificationClick}
        onProfileClick={onProfileClick}
        onSettingsClick={onSettingsClick}
        onLogoutClick={onLogoutClick}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        {showSidebar && (
          <aside className="hidden md:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)]">
              <Sidebar
                items={sidebarItems}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onItemClick={handleSidebarItemClick}
              />
            </div>
          </aside>
        )}

        {/* Mobile Sidebar */}
        {showSidebar && (
          <MobileSidebar
            open={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            items={sidebarItems}
            onItemClick={handleSidebarItemClick}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

// Dashboard Layout - specific layout for dashboard pages
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  user?: LayoutProps['user'];
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
  actions,
  user,
  className,
}) => {
  return (
    <Layout
      user={user}
      showSidebar={true}
      showFooter={false}
      className={className}
    >
      {/* Page Header */}
      {(title || description || actions) && (
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      {children}
    </Layout>
  );
};

// Auth Layout - for login/signup pages
interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left side - Branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary font-bold mr-2">
              M
            </div>
            MVT
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "MVT has transformed how veterans connect and support each other in their professional journeys."
              </p>
              <footer className="text-sm">Sofia Davis, Army Veteran</footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Public Layout - for marketing pages
interface PublicLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <Layout
      showSidebar={false}
      showFooter={true}
      className={className}
    >
      {children}
    </Layout>
  );
};

export { Layout, DashboardLayout, AuthLayout, PublicLayout };
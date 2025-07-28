import * as React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare,
  Calendar,
  Users,
  Home,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
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
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  showSearch = true,
  user,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  className,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/search', label: 'Find Mentors', icon: Users },
    { href: '/sessions', label: 'My Sessions', icon: Calendar },
    { href: '/requests', label: 'Requests', icon: MessageSquare },
  ];

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full border-b border-prussian_blue-200/20 bg-papaya_whip-500/95 backdrop-blur supports-[backdrop-filter]:bg-papaya_whip-500/60 shadow-soft',
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fire_brick-500 text-papaya_whip-500 font-bold">
                  M
                </div>
                <span className="font-bold text-xl text-prussian_blue-500">MVT</span>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-fire_brick-50 text-prussian_blue-500 hover:text-fire_brick-600 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-fire_brick-500 text-papaya_whip-500 font-bold">
              M
            </div>
            <span className="hidden font-bold sm:inline-block text-xl text-prussian_blue-500">MVT</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-fire_brick-500 text-prussian_blue-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 focus-ring"
              />
            </form>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative focus-ring"
          >
            <Bell className="h-5 w-5" />
            {user?.unreadNotifications && user.unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {user.unreadNotifications > 9 ? '9+' : user.unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-ring">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Sessions
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  My Mentees
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/onboarding">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };

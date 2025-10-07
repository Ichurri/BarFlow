'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TableCellsIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { cn, getRoleColor } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon },
    { name: 'Tables', href: '/tables', icon: TableCellsIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ],
  bar: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  ],
  waiter: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Tables', href: '/tables', icon: TableCellsIcon },
    { name: 'My Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  ],
};

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userNavigation = navigation[user.role] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900/80" />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 px-6 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">BarFlow</h1>
              <button
                type="button"
                className="text-gray-300 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-8">
              <ul role="list" className="space-y-1">
                {userNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-300 hover:text-white hover:bg-gray-800"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center gap-x-3 px-3 py-2 text-sm font-semibold leading-6 text-gray-300">
                  <div className="flex-auto">
                    <div className="text-white text-sm">{user.username}</div>
                    <div className={cn(
                      'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border mt-1',
                      getRoleColor(user.role)
                    )}>
                      {user.role.toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-gray-900">
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-xl font-bold text-white">BarFlow</h1>
        </div>
        
        <nav className="flex flex-1 flex-col px-6 pb-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {userNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-300">
                <div className="flex-auto">
                  <div className="text-white">{user.username}</div>
                  <div className={cn(
                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border',
                    getRoleColor(user.role)
                  )}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <button
            type="button"
            className="text-gray-700 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            BarFlow
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-sm text-gray-600">{user.username}</span>
            <div className={cn(
              'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border',
              getRoleColor(user.role)
            )}>
              {user.role.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-4 lg:py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
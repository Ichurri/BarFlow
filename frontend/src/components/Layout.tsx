'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  TableCellsIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
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
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900">
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

      {/* Main content */}
      <div className="pl-64">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
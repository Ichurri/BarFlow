'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, inventoryApi, paymentsApi, tablesApi } from '@/lib/api';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  TableCellsIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg p-4 sm:p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} aria-hidden="true" />
        </div>
        <div className="ml-3 sm:ml-5 w-0 flex-1">
          <dl>
            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-base sm:text-lg lg:text-xl font-medium text-gray-900">{value}</dd>
            {description && (
              <dd className="text-xs text-gray-500 mt-1">{description}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch data based on user role
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => user?.role === 'waiter' ? ordersApi.getMyOrders() : ordersApi.getAll(),
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
    enabled: user?.role !== 'waiter',
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
    enabled: user?.role === 'admin',
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => user?.role === 'waiter' ? tablesApi.getMyTables() : tablesApi.getAll(),
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: paymentsApi.getPending,
    enabled: user?.role === 'bar' || user?.role === 'admin',
  });

  // Calculate statistics
  const stats = {
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
    readyOrders: orders?.filter(order => order.status === 'ready').length || 0,
    completedOrders: orders?.filter(order => order.status === 'completed').length || 0,
    totalRevenue: orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0,
    availableTables: tables?.filter(table => table.status === 'available').length || 0,
    occupiedTables: tables?.filter(table => table.status === 'occupied').length || 0,
    lowStockItems: lowStock?.length || 0,
    pendingPaymentCount: pendingPayments?.length || 0,
  };

  const getStatsForRole = () => {
    const baseStats = [
      {
        title: 'Total Orders',
        value: stats.totalOrders,
        icon: ClipboardDocumentListIcon,
        color: 'text-blue-600',
        description: user?.role === 'waiter' ? 'Your orders' : 'All orders',
      },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseStats,
          {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            description: 'From completed orders',
          },
          {
            title: 'Inventory Items',
            value: inventory?.length || 0,
            icon: ArchiveBoxIcon,
            color: 'text-purple-600',
            description: `${stats.lowStockItems} low stock`,
          },
          {
            title: 'Tables',
            value: `${stats.availableTables}/${tables?.length || 0}`,
            icon: TableCellsIcon,
            color: 'text-indigo-600',
            description: 'Available tables',
          },
          {
            title: 'Pending Payments',
            value: stats.pendingPaymentCount,
            icon: CreditCardIcon,
            color: 'text-amber-600',
            description: 'Awaiting verification',
          },
        ];

      case 'bar':
        return [
          ...baseStats,
          {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: ClipboardDocumentListIcon,
            color: 'text-yellow-600',
            description: 'Need confirmation',
          },
          {
            title: 'Inventory Items',
            value: inventory?.length || 0,
            icon: ArchiveBoxIcon,
            color: 'text-purple-600',
            description: 'Available products',
          },
          {
            title: 'Pending Payments',
            value: stats.pendingPaymentCount,
            icon: CreditCardIcon,
            color: 'text-amber-600',
            description: 'Need verification',
          },
        ];

      case 'waiter':
        return [
          ...baseStats,
          {
            title: 'Ready Orders',
            value: stats.readyOrders,
            icon: ClipboardDocumentListIcon,
            color: 'text-green-600',
            description: 'Ready for delivery',
          },
          {
            title: 'My Tables',
            value: `${stats.availableTables}/${tables?.length || 0}`,
            icon: TableCellsIcon,
            color: 'text-indigo-600',
            description: 'Available tables',
          },
          {
            title: 'Revenue Today',
            value: formatCurrency(stats.totalRevenue),
            icon: CurrencyDollarIcon,
            color: 'text-green-600',
            description: 'Your sales',
          },
        ];

      default:
        return baseStats;
    }
  };

  const dashboardStats = getStatsForRole();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Welcome back, {user?.username}! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              description={stat.description}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {user?.role === 'admin' && (
              <>
                <a
                  href="/inventory"
                  className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 transition-colors duration-200"
                >
                  <ArchiveBoxIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Manage Inventory</p>
                    <p className="text-xs sm:text-sm text-gray-500">Add or update products</p>
                  </div>
                </a>
                <a
                  href="/users"
                  className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 transition-colors duration-200"
                >
                  <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">User Management</p>
                    <p className="text-xs sm:text-sm text-gray-500">Manage staff accounts</p>
                  </div>
                </a>
              </>
            )}
            
            {(user?.role === 'bar' || user?.role === 'admin') && (
              <>
                <a
                  href="/orders"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Pending Orders</p>
                    <p className="text-sm text-gray-500">Review and confirm orders</p>
                  </div>
                </a>
                <a
                  href="/payments"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                >
                  <CreditCardIcon className="h-6 w-6 text-amber-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Verify Payments</p>
                    <p className="text-sm text-gray-500">Confirm cash payments</p>
                  </div>
                </a>
              </>
            )}

            {user?.role === 'waiter' && (
              <>
                <a
                  href="/tables"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                >
                  <TableCellsIcon className="h-6 w-6 text-indigo-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">My Tables</p>
                    <p className="text-sm text-gray-500">Manage assigned tables</p>
                  </div>
                </a>
                <a
                  href="/orders"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Ready Orders</p>
                    <p className="text-sm text-gray-500">Orders ready for delivery</p>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
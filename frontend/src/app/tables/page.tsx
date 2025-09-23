'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import QRModal from '@/components/QRModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesApi } from '@/lib/api';
import { getStatusColor, cn } from '@/lib/utils';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CheckIcon, 
  XMarkIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { Table } from '@/types';

const statusConfig = {
  available: {
    label: 'Available',
    color: 'green',
    icon: CheckIcon,
  },
  occupied: {
    label: 'Occupied',
    color: 'red',
    icon: UserGroupIcon,
  },
  reserved: {
    label: 'Reserved',
    color: 'blue',
    icon: ClockIcon,
  },
  cleaning: {
    label: 'Cleaning',
    color: 'yellow',
    icon: WrenchScrewdriverIcon,
  },
  out_of_service: {
    label: 'Out of Service',
    color: 'gray',
    icon: XMarkIcon,
  },
};

function TableCard({ table }: { table: Table }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ tableId, status }: { tableId: number; status: Table['status'] }) =>
      tablesApi.updateStatus(tableId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const config = statusConfig[table.status];
  const IconComponent = config?.icon || CheckIcon;

  const canChangeStatus = () => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'waiter' && table.waiter_id === user.id) return true;
    return false;
  };

  const getAvailableStatuses = () => {
    const allStatuses = Object.keys(statusConfig) as Table['status'][];
    return allStatuses.filter(status => status !== table.status);
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconComponent className={cn(
                'h-8 w-8',
                getStatusColor(table.status, 'text')
              )} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Table #{table.id}
              </h3>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {table.capacity} seats
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {table.location}
                </div>
              </div>
            </div>
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(table.status, 'badge')
          )}>
            {config?.label || table.status}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500">
            Assigned Waiter: {table.waiter?.user?.username || 'Unassigned'}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            QR Code: {table.qr_code}
          </div>
          <button
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
          >
            <QrCodeIcon className="h-4 w-4 mr-1" />
            Show QR
          </button>
        </div>

        {canChangeStatus() && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Status:
            </label>
            <div className="flex flex-wrap gap-2">
              {getAvailableStatuses().map((status) => {
                const statusConf = statusConfig[status];
                return (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate({
                      tableId: table.id,
                      status
                    })}
                    disabled={updateStatusMutation.isPending}
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {statusConf?.label || status}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        tableId={table.id}
        tableName={`Table #${table.id}`}
      />
    </div>
  );
}

export default function TablesPage() {
  const { user } = useAuth();

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  // Filter tables for waiters (only their assigned tables)
  const filteredTables = tables?.filter(table => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'waiter') return table.waiter_id === user.id;
    return true;
  }) || [];

  // Group tables by status
  const tablesByStatus = filteredTables.reduce((acc, table) => {
    if (!acc[table.status]) {
      acc[table.status] = [];
    }
    acc[table.status].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'waiter' 
              ? 'Manage your assigned tables' 
              : 'Monitor and manage all tables in the nightclub'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(tablesByStatus).map(([status, statusTables]) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            return (
              <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        'h-8 w-8 rounded-md flex items-center justify-center',
                        getStatusColor(status, 'bg')
                      )}>
                        {config?.icon && (
                          <config.icon className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {config?.label || status}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statusTables.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tables Grid */}
        {filteredTables.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tables</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'waiter' 
                ? 'No tables assigned to you.'
                : 'No tables found.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
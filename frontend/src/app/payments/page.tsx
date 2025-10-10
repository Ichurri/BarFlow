'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { formatCurrency, getStatusColor, cn } from '@/lib/utils';
import { 
  CheckIcon, 
  XMarkIcon, 
  ClockIcon,
  CreditCardIcon,
  QrCodeIcon,
  EyeIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Payment } from '@/types';

const statusConfig = {
  pending: {
    label: 'Pending Verification',
    color: 'yellow',
    icon: ClockIcon,
  },
  verified: {
    label: 'Verified',
    color: 'green',
    icon: CheckIcon,
  },
  rejected: {
    label: 'Rejected',
    color: 'red',
    icon: XMarkIcon,
  },
};

const methodConfig = {
  cash: {
    label: 'Cash',
    icon: CreditCardIcon,
  },
  qr: {
    label: 'QR Payment',
    icon: QrCodeIcon,
  },
};

function PaymentCard({ payment }: { payment: Payment }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // Get order items from either property name (backend uses 'orderItems', some might use 'items')
  const orderItems = payment.order?.orderItems || payment.order?.items || [];
  
  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentId: number) => paymentsApi.verify(paymentId, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: ({ paymentId, notes }: { paymentId: number; notes: string }) => 
      paymentsApi.reject(paymentId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const config = statusConfig[payment.status];
  const methodConf = methodConfig[payment.method];
  const IconComponent = config?.icon || ClockIcon;
  const MethodIcon = methodConf?.icon || CreditCardIcon;

  const canVerifyPayment = () => {
    if (payment.status !== 'pending') return false;
    
    if (user?.role === 'admin' || user?.role === 'bar') {
      return true; // Admin and bar can verify any payment
    }
    
    if (user?.role === 'waiter') {
      return payment.method === 'cash'; // Waiters can only verify cash payments
    }
    
    return false;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <IconComponent className={cn(
              'h-6 w-6 sm:h-8 sm:w-8',
              getStatusColor(payment.status, 'text')
            )} />
          </div>
          <div className="ml-3 sm:ml-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Payment #{payment.id}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Order #{payment.order_id} • {new Date(payment.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto',
          getStatusColor(payment.status, 'badge')
        )}>
          {config?.label || payment.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-semibold text-gray-800">Amount</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {payment.order?.total_amount ? formatCurrency(payment.order.total_amount) : 'N/A'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-gray-800">Method</dt>
          <dd className="mt-1 flex items-center text-sm text-gray-900">
            <MethodIcon className="h-4 w-4 mr-2" />
            {methodConf?.label || payment.method}
          </dd>
        </div>
      </dl>

      {payment.transaction_id && (
        <dl className="mt-3">
          <dt className="text-sm font-semibold text-gray-800">Transaction ID</dt>
          <dd className="mt-1 text-sm text-gray-900 font-mono">
            {payment.transaction_id}
          </dd>
        </dl>
      )}

      {payment.verifier && (
        <div className="mt-3 text-sm text-gray-700 font-medium">
          Verified by: <span className="text-gray-900">{payment.verifier.username}</span>
        </div>
      )}

      {canVerifyPayment() && (
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => verifyPaymentMutation.mutate(payment.id)}
            disabled={verifyPaymentMutation.isPending}
            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            {verifyPaymentMutation.isPending ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={() => {
              const notes = prompt('Reason for rejection:');
              if (notes) {
                rejectPaymentMutation.mutate({ paymentId: payment.id, notes });
              }
            }}
            disabled={rejectPaymentMutation.isPending}
            className="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            {rejectPaymentMutation.isPending ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={() => setShowOrderDetails(!showOrderDetails)}
          className="text-sm text-purple-600 hover:text-purple-500 flex items-center"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          {showOrderDetails ? 'Hide Order Details' : 'View Order Details'}
        </button>
        
        {showOrderDetails && payment.order && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-4">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-2 border-b border-gray-300 space-y-2 sm:space-y-0">
                <div>
                  <h4 className="font-semibold text-gray-900">Order #{payment.order.id}</h4>
                  <p className="text-sm text-gray-500">Table #{payment.order.table_id}</p>
                </div>
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto',
                  payment.order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  payment.order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  payment.order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                )}>
                  {payment.order.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Order Items */}
              {orderItems && orderItems.length > 0 ? (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Items Ordered:</h5>
                  <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {orderItems.map((item, index) => (
                        <div key={index} className="px-3 py-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.inventory?.name || `Product #${item.inventory_id}`}
                              </p>
                              <div className="flex flex-wrap items-center text-xs text-gray-700 mt-1 gap-x-2 font-medium">
                                <span>Qty: {item.quantity}</span>
                                <span>•</span>
                                <span>Unit: {formatCurrency(item.price || item.unit_price || 0)}</span>
                                {item.inventory?.category && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{item.inventory.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency((item.price || item.unit_price || 0) * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-gray-500 text-sm">
                  No items information available
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-800 font-medium">Payment Method:</span>
                    <span className="font-medium flex items-center text-gray-900">
                      <MethodIcon className="h-4 w-4 mr-1" />
                      {methodConf?.label || payment.method}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-800 font-medium">Order Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(payment.order.created_at || payment.created_at).toLocaleDateString()} at{' '}
                      {new Date(payment.order.created_at || payment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                    <span className="text-gray-800 font-medium">Payment Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(payment.created_at).toLocaleDateString()} at{' '}
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {payment.order.waiter && (
                    <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                      <span className="text-gray-800 font-medium">Served by:</span>
                      <span className="font-medium text-gray-900">{payment.order.waiter.user?.username || 'N/A'}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-green-600">{formatCurrency(payment.order.total_amount || '0')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {payment.order.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h6 className="text-sm font-medium text-blue-900 mb-1">Order Notes:</h6>
                  <p className="text-sm text-blue-800 italic">{payment.order.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    table_id: '',
    from_date: '',
    to_date: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch all payments with filters
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['all-payments', filters, page, user?.role],
    queryFn: () => paymentsApi.getAll({
      status: filters.status || undefined,
      method: filters.method || undefined,
      table_id: filters.table_id ? parseInt(filters.table_id) : undefined,
      from_date: filters.from_date || undefined,
      to_date: filters.to_date || undefined,
      limit,
      offset: page * limit,
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user && (user?.role === 'admin' || user?.role === 'bar' || user?.role === 'waiter'),
  });

  // Separate query for pending payments count (for alert)
  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments-count'],
    queryFn: () => paymentsApi.getAll({ status: 'pending', limit: 1000 }),
    refetchInterval: 10000,
    enabled: !!user && (user?.role === 'admin' || user?.role === 'bar' || user?.role === 'waiter'),
  });

  const payments = paymentsData?.payments || [];
  const pendingCount = pendingPayments?.payments?.length || 0;

  // Statistics
  const stats = useMemo(() => {
    if (!payments.length) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPayments = payments.filter(p => new Date(p.created_at) >= today);
    const totalToday = todayPayments.reduce((sum, p) => sum + (parseFloat(p.order?.total_amount?.toString() || '0')), 0);
    
    const statusCounts = payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const methodCounts = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      todayPayments: todayPayments.length,
      totalToday,
      statusCounts,
      methodCounts,
    };
  }, [payments]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      method: '',
      table_id: '',
      from_date: '',
      to_date: '',
    });
    setPage(0);
  };

  if (isLoading && page === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete payment history with filters and search
            </p>
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUpIcon className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 ml-2" />
            )}
          </button>
        </div>

        {/* Pending Payments Alert */}
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {pendingCount} Pending Payments
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>There are payments waiting for verification.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-purple-600">{stats.todayPayments}</div>
              <div className="text-sm text-gray-700 font-medium">Today&apos;s Payments</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalToday)}</div>
              <div className="text-sm text-gray-700 font-medium">Today&apos;s Revenue</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">{stats.statusCounts.verified || 0}</div>
              <div className="text-sm text-gray-700 font-medium">Verified</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-red-600">{stats.statusCounts.rejected || 0}</div>
              <div className="text-sm text-gray-700 font-medium">Rejected</div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={filters.method}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="qr">QR Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                <input
                  type="number"
                  placeholder="Table number"
                  value={filters.table_id}
                  onChange={(e) => handleFilterChange('table_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => handleFilterChange('from_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => handleFilterChange('to_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Payments List */}
        {payments.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Payments ({paymentsData?.total || 0} total)
              </h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>

            {/* Pagination */}
            {paymentsData && paymentsData.total > limit && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!paymentsData.hasMore}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{page * limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min((page + 1) * limit, paymentsData.total)}
                      </span>{' '}
                      of <span className="font-medium">{paymentsData.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!paymentsData.hasMore}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or date range.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { formatCurrency, getStatusColor, cn } from '@/lib/utils';
import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Order } from '@/types';

const statusConfig = {
  pending: {
    label: 'Pending Payment',
    color: 'yellow',
    icon: ClockIcon,
  },
  confirmed: {
    label: 'Payment Confirmed',
    color: 'green',
    icon: CheckIcon,
  },
  preparing: {
    label: 'Preparing',
    color: 'blue',
    icon: ClockIcon,
  },
  ready: {
    label: 'Ready',
    color: 'purple',
    icon: CheckIcon,
  },
  delivered: {
    label: 'Delivered',
    color: 'gray',
    icon: CheckIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    icon: XMarkIcon,
  },
};

function OrderCard({ order }: { order: Order }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const confirmOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.confirm(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const markPreparingMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.markPreparing(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const markReadyMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.markReady(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deliverOrderMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.deliver(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: Order['status'] }) =>
      ordersApi.updateStatus(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const config = statusConfig[order.status as keyof typeof statusConfig];
  const IconComponent = config?.icon || ClockIcon;

  const getAvailableActions = () => {
    const actions = [];

    // Admin puede hacer todo
    if (user?.role === 'admin') {
      switch (order.status) {
        case 'pending':
          actions.push({ type: 'confirm', label: 'Confirm Payment', mutation: confirmOrderMutation });
          break;
        case 'confirmed':
          actions.push({ type: 'preparing', label: 'Start Preparing', mutation: markPreparingMutation });
          break;
        case 'preparing':
          actions.push({ type: 'ready', label: 'Mark Ready', mutation: markReadyMutation });
          break;
        case 'ready':
          actions.push({ type: 'deliver', label: 'Mark Delivered', mutation: deliverOrderMutation });
          break;
      }
    }
    // Barra puede confirmar pagos y manejar preparación
    else if (user?.role === 'bar') {
      switch (order.status) {
        case 'pending':
          actions.push({ type: 'confirm', label: 'Confirm Payment', mutation: confirmOrderMutation });
          break;
        case 'confirmed':
          actions.push({ type: 'preparing', label: 'Start Preparing', mutation: markPreparingMutation });
          break;
        case 'preparing':
          actions.push({ type: 'ready', label: 'Mark Ready', mutation: markReadyMutation });
          break;
      }
    }
    // Mesero puede entregar órdenes listas
    else if (user?.role === 'waiter') {
      if (order.status === 'ready') {
        actions.push({ type: 'deliver', label: 'Mark Delivered', mutation: deliverOrderMutation });
      }
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <div className="card-responsive bg-white overflow-hidden shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <IconComponent className={cn(
              'h-6 w-6 sm:h-8 sm:w-8',
              getStatusColor(order.status, 'text')
            )} />
          </div>
          <div className="ml-3 sm:ml-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Order #{order.id}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 font-medium">
              Table {order.table?.id || order.table_id} • {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto',
          getStatusColor(order.status, 'badge')
        )}>
          {config?.label || order.status}
        </span>
      </div>

      <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
          <ul className="space-y-1">
            {(order.orderItems || order.items || []).map((item, index) => (
              <li key={item.id || index} className="flex justify-between text-sm">
                <span className="text-gray-800 font-medium">
                  {item.quantity}x {item.inventory?.name || `Item ${item.inventory_id}`}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {(order.orderItems || order.items || []).length === 0 && (
            <p className="text-sm text-gray-700 italic font-medium">No items found</p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700 font-medium">
            {order.waiter?.user?.username && `Waiter: ${order.waiter.user.username}`}
          </div>
          <div className="flex space-x-2">
            {availableActions.map((action, index) => (
              <button
                key={action.type}
                onClick={() => action.mutation.mutate(order.id)}
                disabled={action.mutation.isPending}
                className={cn(
                  "inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50",
                  action.type === 'confirm' ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" :
                  action.type === 'preparing' ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" :
                  action.type === 'ready' ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500" :
                  action.type === 'deliver' ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" :
                  "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
                )}
              >
                {action.mutation.isPending ? 'Processing...' : action.label}
              </button>
            ))}
            {user?.role === 'admin' && order.status === 'pending' && (
              <button
                onClick={() => updateStatusMutation.mutate({
                  orderId: order.id,
                  status: 'cancelled'
                })}
                disabled={updateStatusMutation.isPending}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.role],
    queryFn: user?.role === 'waiter' ? ordersApi.getMyOrders : ordersApi.getAll,
    enabled: !!user,
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: ordersApi.getPending,
    refetchInterval: 5000, // Refresh every 5 seconds
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

  // Filter orders based on user role (backend already handles waiter filtering)
  const filteredOrders = orders?.filter(order => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'bar') return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
    if (user?.role === 'waiter') return true; // Backend already filters waiter orders
    return false;
  }) || [];

  // Group orders by status
  const ordersByStatus = filteredOrders.reduce((acc, order) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="heading-responsive font-bold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-responsive text-gray-700 font-medium">
            {user?.role === 'bar' ? 'Prepare and manage drink orders' : 
             user?.role === 'waiter' ? 'View and deliver orders' : 
             'Monitor all orders and operations'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid-responsive grid-responsive-sm-2 grid-responsive-lg-4 gap-4 sm:gap-5">
          {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
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
                        <dt className="text-sm font-semibold text-gray-700 truncate">
                          {config?.label || status}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {statusOrders.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
              <div key={status}>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {statusConfig[status as keyof typeof statusConfig]?.label || status} Orders
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {statusOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-700 font-medium">
              No orders found for your role.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
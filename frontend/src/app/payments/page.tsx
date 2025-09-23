'use client';

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
  EyeIcon
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
    return (user?.role === 'admin' || user?.role === 'bar') && payment.status === 'pending';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconComponent className={cn(
                'h-8 w-8',
                getStatusColor(payment.status, 'text')
              )} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Payment #{payment.id}
              </h3>
              <p className="text-sm text-gray-500">
                Order #{payment.order_id} • {new Date(payment.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            getStatusColor(payment.status, 'badge')
          )}>
            {config?.label || payment.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(payment.total_amount)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Method</dt>
            <dd className="mt-1 flex items-center text-sm text-gray-900">
              <MethodIcon className="h-4 w-4 mr-2" />
              {methodConf?.label || payment.method}
            </dd>
          </div>
        </div>

        {payment.transaction_id && (
          <div className="mt-3">
            <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {payment.transaction_id}
            </dd>
          </div>
        )}

        {payment.verifier && (
          <div className="mt-3 text-sm text-gray-500">
            Verified by: {payment.verifier.username}
          </div>
        )}

        {canVerifyPayment() && (
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => verifyPaymentMutation.mutate(payment.id)}
              disabled={verifyPaymentMutation.isPending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              {rejectPaymentMutation.isPending ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-purple-600 hover:text-purple-500 flex items-center">
            <EyeIcon className="h-4 w-4 mr-1" />
            View Order Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();

  const { data: pendingPayments, isLoading } = useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: paymentsApi.getPending,
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: user?.role === 'admin' || user?.role === 'bar',
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

  const payments = pendingPayments || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Verify and manage payment transactions
          </p>
        </div>

        {/* Pending Payments Alert */}
        {payments.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pending Payments
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{payments.length} payments are waiting for verification.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments List */}
        {payments.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Pending Payments
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending payments</h3>
            <p className="mt-1 text-sm text-gray-500">
              All payments have been processed.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
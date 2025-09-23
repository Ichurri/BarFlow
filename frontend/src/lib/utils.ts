import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Price formatting utility
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Status color utilities
export const getStatusColor = (status: string, type: 'badge' | 'text' | 'bg' = 'badge') => {
  const statusColors = {
    // Order statuses
    pending: { 
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'text-yellow-600',
      bg: 'bg-yellow-500'
    },
    confirmed: { 
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'text-blue-600',
      bg: 'bg-blue-500'
    },
    preparing: { 
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      text: 'text-orange-600',
      bg: 'bg-orange-500'
    },
    ready: { 
      badge: 'bg-green-100 text-green-800 border-green-200',
      text: 'text-green-600',
      bg: 'bg-green-500'
    },
    delivered: { 
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      text: 'text-purple-600',
      bg: 'bg-purple-500'
    },
    payment_pending: { 
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      text: 'text-amber-600',
      bg: 'bg-amber-500'
    },
    completed: { 
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      text: 'text-emerald-600',
      bg: 'bg-emerald-500'
    },
    cancelled: { 
      badge: 'bg-red-100 text-red-800 border-red-200',
      text: 'text-red-600',
      bg: 'bg-red-500'
    },
    
    // Table statuses
    available: { 
      badge: 'bg-green-100 text-green-800 border-green-200',
      text: 'text-green-600',
      bg: 'bg-green-500'
    },
    occupied: { 
      badge: 'bg-red-100 text-red-800 border-red-200',
      text: 'text-red-600',
      bg: 'bg-red-500'
    },
    reserved: { 
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'text-blue-600',
      bg: 'bg-blue-500'
    },
    cleaning: { 
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      text: 'text-yellow-600',
      bg: 'bg-yellow-500'
    },
    out_of_service: { 
      badge: 'bg-gray-100 text-gray-800 border-gray-200',
      text: 'text-gray-600',
      bg: 'bg-gray-500'
    },
    
    // Payment statuses
    verified: { 
      badge: 'bg-green-100 text-green-800 border-green-200',
      text: 'text-green-600',
      bg: 'bg-green-500'
    },
    rejected: { 
      badge: 'bg-red-100 text-red-800 border-red-200',
      text: 'text-red-600',
      bg: 'bg-red-500'
    },
  };

  const defaultColors = {
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
    text: 'text-gray-600',
    bg: 'bg-gray-500'
  };

  return statusColors[status as keyof typeof statusColors]?.[type] || defaultColors[type];
};

// Format currency
export const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

// Format date
export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Capitalize first letter
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Get role color
export const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    bar: 'bg-blue-100 text-blue-800 border-blue-200',
    waiter: 'bg-green-100 text-green-800 border-green-200',
  };

  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
};
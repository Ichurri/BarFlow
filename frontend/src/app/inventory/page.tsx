'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { formatCurrency, getStatusColor, cn } from '@/lib/utils';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function InventoryPage() {
  const { user } = useAuth();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
    enabled: user?.role === 'admin',
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage drinks and products for your nightclub
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </button>
          )}
        </div>

        {/* Low Stock Alert */}
        {user?.role === 'admin' && lowStock && lowStock.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{lowStock.length} products are running low on stock.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Grid */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {inventory?.map((item) => {
              const isLowStock = item.stock <= item.min_stock;
              return (
                <li key={item.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={item.photo_url}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-drink.svg';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          {isLowStock && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <div className="flex items-center mt-1 space-x-4">
                          <p className="text-sm text-gray-900">
                            Sale: {formatCurrency(item.sale_price)}
                          </p>
                          {user?.role === 'admin' && item.cost_price && (
                            <p className="text-sm text-gray-500">
                              Cost: {formatCurrency(item.cost_price)}
                            </p>
                          )}
                          <p className={cn(
                            'text-sm font-medium',
                            isLowStock ? 'text-red-600' : 'text-green-600'
                          )}>
                            Stock: {item.stock}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {(user?.role === 'admin' || user?.role === 'bar') && (
                        <button
                          className="text-gray-400 hover:text-gray-500"
                          title="Edit product"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          className="text-red-400 hover:text-red-500"
                          title="Delete product"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Empty State */}
        {inventory?.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product to the inventory.
            </p>
            {user?.role === 'admin' && (
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
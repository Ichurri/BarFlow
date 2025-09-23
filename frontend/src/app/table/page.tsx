'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, tablesApi, ordersApi } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { 
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface TableInfo {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved';
}

export default function TableOrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const queryClient = useQueryClient();

  // Fetch menu items (inventory)
  const { data: menuItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
  });

  // Fetch table info
  const { data: table } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tableId ? tablesApi.getById(parseInt(tableId)) : null,
    enabled: !!tableId,
  });

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Filter items by category
  const filteredItems = menuItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return ordersApi.create(orderData);
    },
    onSuccess: () => {
      setIsOrderPlaced(true);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const addToCart = (item: any) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, {
          id: item.id,
          name: item.name,
          price: item.sale_price,
          quantity: 1,
          category: item.category
        }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prev.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (!tableId || cart.length === 0) return;

    const orderData = {
      table_id: parseInt(tableId),
      items: cart.map(item => ({
        inventory_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: getTotalPrice(),
      status: 'pending'
    };

    placeOrderMutation.mutate(orderData);
  };

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Table</h1>
          <p className="text-gray-600">Please scan a valid QR code to access the menu.</p>
        </div>
      </div>
    );
  }

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been sent to the kitchen. A waiter will serve your drinks shortly.
          </p>
          <button
            onClick={() => setIsOrderPlaced(false)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
          >
            Order More Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BarFlow Menu</h1>
              <p className="text-gray-600">
                Table: #{tableId}
              </p>
            </div>
            {cart.length > 0 && (
              <div className="relative">
                <button className="bg-purple-600 text-white p-2 rounded-full">
                  <ShoppingCartIcon className="h-6 w-6" />
                </button>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-full transition-colors',
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-purple-600">
                      {formatPrice(item.sale_price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Stock: {item.stock}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="font-medium">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={item.stock <= 0}
                            className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center hover:bg-purple-200 disabled:opacity-50"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock <= 0}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                        >
                          {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No items found in this category.</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm sticky top-4">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placeOrderMutation.isPending}
                      className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {placeOrderMutation.isPending ? (
                        <div className="flex items-center justify-center">
                          <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                          Placing Order...
                        </div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
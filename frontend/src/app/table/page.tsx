'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, tablesApi, ordersApi, paymentsApi } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { Order, InventoryItem, CreateOrder } from '@/types';
import Image from 'next/image';
import { 
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  BanknotesIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export default function TableOrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'qr' | null>(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentPayment, setCurrentPayment] = useState<{ id: number } | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const queryClient = useQueryClient();

  // Fetch menu items (public inventory - no auth required)
  const { data: menuItems = [] } = useQuery({
    queryKey: ['inventory-public'],
    queryFn: inventoryApi.getPublic,
  });

  // Fetch table info
  const { data: table } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tableId ? tablesApi.getById(parseInt(tableId)) : null,
    enabled: !!tableId,
  });

  // Remove unused variables to fix linting
  console.log('Table info:', table);

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Filter items by category
  const filteredItems = menuItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // Place order mutation (using customer endpoint - no auth required)
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrder) => {
      return ordersApi.createCustomer(orderData);
    },
    onSuccess: () => {
      setIsOrderPlaced(true);
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const addToCart = (item: InventoryItem) => {
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
    setShowPaymentOptions(true);
  };

  // Crear orden después de seleccionar método de pago
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrder) => {
      return ordersApi.createCustomer(orderData);
    },
    onSuccess: (order) => {
      setCurrentOrder(order);
      // Iniciar el proceso de pago
      if (selectedPaymentMethod) {
        initiatePaymentMutation.mutate({
          orderId: order.id,
          method: selectedPaymentMethod
        });
      }
    },
  });

  // Iniciar pago
  const initiatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, method }: { orderId: number, method: 'cash' | 'qr' }) => {
      return paymentsApi.initiateCustomer(orderId, method);
    },
    onSuccess: (payment) => {
      setCurrentPayment(payment);
      if (selectedPaymentMethod === 'qr') {
        setShowQRPayment(true);
      } else {
        // Para efectivo, mostrar mensaje de espera
        setIsOrderPlaced(true);
        setCart([]);
        setShowPaymentOptions(false);
      }
    },
  });

  // Confirmar pago por QR
  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return paymentsApi.confirmCustomer(paymentId);
    },
    onSuccess: () => {
      setPaymentConfirmed(true);
      setShowQRPayment(false);
      setIsOrderPlaced(true);
      setCart([]);
      setShowPaymentOptions(false);
    },
  });

  const handlePaymentMethodSelect = (method: 'cash' | 'qr') => {
    setSelectedPaymentMethod(method);
    
    const orderData = {
      table_id: parseInt(tableId!),
      items: cart.map(item => ({
        inventory_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total_amount: getTotalPrice(),
      status: 'pending'
    };

    createOrderMutation.mutate(orderData);
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

  // Pantalla de selección de método de pago
  if (showPaymentOptions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Select Payment Method</h2>
          <p className="text-gray-600 mb-6 text-center">
            Total: <span className="font-bold text-lg">{formatPrice(getTotalPrice())}</span>
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handlePaymentMethodSelect('qr')}
              disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
              className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <QrCodeIcon className="h-6 w-6 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Pay with QR Code</div>
                <div className="text-sm text-gray-600">Scan and pay instantly</div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('cash')}
              disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
              className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <BanknotesIcon className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Pay with Cash</div>
                <div className="text-sm text-gray-600">Pay when waiter arrives</div>
              </div>
            </button>
          </div>
          
          <button
            onClick={() => setShowPaymentOptions(false)}
            className="w-full mt-6 py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Cart
          </button>
          
          {(createOrderMutation.isPending || initiatePaymentMutation.isPending) && (
            <div className="mt-4 text-center text-gray-600">
              <ClockIcon className="inline h-4 w-4 mr-2" />
              Processing...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pantalla de pago con QR
  if (showQRPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Scan QR Code to Pay</h2>
          <p className="text-gray-600 mb-6">
            Total: <span className="font-bold text-lg">{formatPrice(getTotalPrice())}</span>
          </p>
          
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Image
                src="/QR.jpeg"
                alt="QR Code for Payment"
                width={200}
                height={200}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Scan this QR code with your banking app to complete the payment
          </p>
          
          <button
            onClick={() => {
              if (currentPayment?.id) {
                confirmPaymentMutation.mutate(currentPayment.id);
              }
            }}
            disabled={confirmPaymentMutation.isPending}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
          >
            {confirmPaymentMutation.isPending ? (
              <>
                <ClockIcon className="inline h-4 w-4 mr-2" />
                Confirming...
              </>
            ) : (
              'I have completed the payment'
            )}
          </button>
          
          <button
            onClick={() => {
              setShowQRPayment(false);
              setShowPaymentOptions(true);
            }}
            className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Payment Options
          </button>
        </div>
      </div>
    );
  }

  if (isOrderPlaced) {
    const isQRPayment = selectedPaymentMethod === 'qr';
    const isCashPayment = selectedPaymentMethod === 'cash';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {paymentConfirmed ? 'Payment Confirmed!' : 'Order Placed Successfully!'}
          </h2>
          
          <div className="text-gray-600 mb-6">
            {isQRPayment && paymentConfirmed && (
              <p>Your payment has been received and is being verified by our staff. Your order is being prepared!</p>
            )}
            {isQRPayment && !paymentConfirmed && (
              <p>Your order has been placed. Please complete the payment to proceed.</p>
            )}
            {isCashPayment && (
              <p>Your order has been sent to the kitchen. Our waiter will collect payment when delivering your order.</p>
            )}
            {!selectedPaymentMethod && (
              <p>Your order has been sent to the kitchen. A waiter will serve your drinks shortly.</p>
            )}
          </div>
          
          <button
            onClick={() => {
              setIsOrderPlaced(false);
              setSelectedPaymentMethod(null);
              setPaymentConfirmed(false);
              setCurrentOrder(null);
            }}
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
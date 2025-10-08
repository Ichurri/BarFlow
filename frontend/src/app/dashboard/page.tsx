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
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  BellIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Quick Stats Grid Component
function QuickStatsGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
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
  );
}

// Top Items Component
interface ItemData {
  inventory_id?: number;
  name: string;
  category: string;
  total_sold?: number;
  recent_sales?: number;
  total_profit?: number;
  profit_margin?: number;
}

function TopItemsCard({ title, items, type }: { 
  title: string; 
  items: ItemData[]; 
  type: 'best' | 'worst' | 'profitable' | 'trending' 
}) {
  const getItemIcon = (type: string) => {
    switch(type) {
      case 'best': return '🏆';
      case 'worst': return '📉';
      case 'profitable': return '💰';
      case 'trending': return '🔥';
      default: return '📊';
    }
  };

  const getItemColor = (index: number, type: string) => {
    if (type === 'best') {
      if (index === 0) return 'text-yellow-600 bg-yellow-50';
      if (index === 1) return 'text-gray-600 bg-gray-50';
      if (index === 2) return 'text-amber-600 bg-amber-50';
    }
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <span className="text-2xl mr-2">{getItemIcon(type)}</span>
        {title}
      </h3>
      
      {items && items.length > 0 ? (
        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={item.inventory_id || index}
              className={`flex items-center justify-between p-3 rounded-lg ${getItemColor(index, type)}`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-white shadow-sm' : ''
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{item.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {type === 'profitable' ? (
                  <div>
                    <p className="font-semibold text-green-600">
                      +${(item.total_profit || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {(item.profit_margin || 0).toFixed(1)}% margen
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{item.total_sold || item.recent_sales}</p>
                    <p className="text-xs text-gray-600">
                      {type === 'trending' ? 'últimos 7 días' : 'vendidos'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
}

// Categories Performance Component
interface CategoryData {
  category: string;
  total_sold: number;
  total_revenue: number;
}

function CategoriesChart({ data }: { data: CategoryData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay datos de categorías disponibles</p>
      </div>
    );
  }

  const categoryColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6b7280'
  ];

  const chartData = {
    labels: data.map(item => item.category || 'Sin categoría'),
    datasets: [{
      data: data.map(item => item.total_sold),
      backgroundColor: data.map((_, index) => categoryColors[index % categoryColors.length]),
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  return (
    <div className="space-y-4">
      <div className="h-64">
        <Doughnut data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11,
                }
              }
            }
          },
          cutout: '60%',
        }} />
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-sm">
        {data.slice(0, 5).map((category, index) => (
          <div key={category.category} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
              ></div>
              <span className="capitalize font-medium">{category.category || 'Sin categoría'}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold">{category.total_sold}</p>
              <p className="text-xs text-gray-600">${category.total_revenue.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}



function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="mt-1 text-3xl font-bold text-gray-900">{value}</dd>
          {description && (
            <dd className="text-sm text-gray-600 mt-1">{description}</dd>
          )}
        </dl>
      </div>
    </div>
  );
}

// Chart Card component
function ChartCard({ title, subtitle, children, className }: { 
  title: string; 
  subtitle?: string; 
  children: React.ReactNode; 
  className?: string 
}) {
  return (
    <div className={cn("bg-white rounded-xl shadow-lg p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch data based on user role
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => user?.role === 'waiter' ? ordersApi.getMyOrders() : ordersApi.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds
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
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: paymentsApi.getPending,
    enabled: user?.role === 'bar' || user?.role === 'admin',
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: itemsStats } = useQuery({
    queryKey: ['orders', 'items', 'stats'],
    queryFn: ordersApi.getItemsStats,
    enabled: user?.role === 'admin' || user?.role === 'bar',
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Enhanced statistics calculation
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const todayOrders = orders?.filter(order => new Date(order.created_at) >= todayStart) || [];
  const yesterdayOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= yesterdayStart && orderDate < todayStart;
  }) || [];

  const stats = {
    // Basic stats
    totalOrders: orders?.length || 0,
    activeOrders: orders?.filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)).length || 0,
    pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
    confirmedOrders: orders?.filter(order => order.status === 'confirmed').length || 0,
    preparingOrders: orders?.filter(order => order.status === 'preparing').length || 0,
    readyOrders: orders?.filter(order => order.status === 'ready').length || 0,
    deliveredOrders: orders?.filter(order => order.status === 'delivered').length || 0,
    
    // Revenue stats
    totalRevenue: orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0,
    todayRevenue: todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
    yesterdayRevenue: yesterdayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
    
    // Table stats
    totalTables: tables?.length || 0,
    availableTables: tables?.filter(table => table.status === 'available').length || 0,
    occupiedTables: tables?.filter(table => table.status === 'occupied').length || 0,
    reservedTables: tables?.filter(table => table.status === 'reserved').length || 0,
    
    // Inventory stats
    totalItems: inventory?.length || 0,
    lowStockItems: lowStock?.length || 0,
    
    // Payment stats
    pendingPaymentCount: pendingPayments?.length || 0,
    
    // Waiter-specific stats
    myTotalTables: user?.role === 'waiter' ? tables?.length || 0 : 0,
    myAvailableTables: user?.role === 'waiter' ? tables?.filter(t => t.status === 'available').length || 0 : 0,
    readyForDelivery: user?.role === 'waiter' ? orders?.filter(o => o.status === 'ready').length || 0 : 0,
  };

  // Calculations for trends
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Chart data configurations
  const orderStatusData = {
    labels: ['Pendiente', 'Confirmado', 'Preparando', 'Listo', 'Entregado'],
    datasets: [{
      data: [
        stats.pendingOrders,
        stats.confirmedOrders,
        stats.preparingOrders,
        stats.readyOrders,
        stats.deliveredOrders,
      ],
      backgroundColor: [
        '#ef4444', // Pending - Red
        '#f59e0b', // Confirmed - Amber
        '#06b6d4', // Preparing - Cyan
        '#10b981', // Ready - Green
        '#8b5cf6', // Delivered - Purple
      ],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  const tableStatusData = {
    labels: ['Disponible', 'Ocupada', 'Reservada'],
    datasets: [{
      data: [stats.availableTables, stats.occupiedTables, stats.reservedTables],
      backgroundColor: [
        '#10b981', // Available - Green
        '#ef4444', // Occupied - Red
        '#f59e0b', // Reserved - Amber
      ],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  const revenueData = {
    labels: ['Ayer', 'Hoy'],
    datasets: [{
      label: 'Ingresos ($)',
      data: [stats.yesterdayRevenue, stats.todayRevenue],
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    }]
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'normal' as const,
          }
        }
      }
    },
    cutout: '65%',
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          }
        }
      }
    }
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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Welcome & Time */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="mt-2 text-blue-100">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} • {format(new Date(), 'HH:mm')}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <div className="bg-white/20 rounded-lg px-3 py-2">
                <span className="text-sm font-medium">
                  {stats.activeOrders} órdenes activas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <QuickStatsGrid stats={dashboardStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Revenue Trend Chart */}
            <ChartCard title="Tendencia de Ingresos" subtitle="Comparación diaria">
              <div className="h-80">
                <Line data={revenueData} options={lineOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Ayer</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${stats.yesterdayRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-600">Hoy</p>
                  <p className="text-lg font-semibold text-blue-900">
                    ${stats.todayRevenue.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-center mt-1">
                    {stats.todayRevenue >= stats.yesterdayRevenue ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs font-medium ${
                      stats.todayRevenue >= stats.yesterdayRevenue ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calculatePercentageChange(stats.todayRevenue, stats.yesterdayRevenue)}%
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Order Status Distribution */}
            <ChartCard title="Estado de Órdenes" subtitle="Distribución actual">
              <div className="h-80">
                <Doughnut data={orderStatusData} options={doughnutOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Pendientes</span>
                  </div>
                  <p className="font-semibold text-lg">{stats.pendingOrders}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Confirmadas</span>
                  </div>
                  <p className="font-semibold text-lg">{stats.confirmedOrders}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Listas</span>
                  </div>
                  <p className="font-semibold text-lg">{stats.readyOrders}</p>
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            
            {/* Table Status */}
            <ChartCard title="Estado de Mesas" subtitle="Ocupación actual">
              <div className="h-64">
                <Doughnut data={tableStatusData} options={doughnutOptions} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Disponibles</span>
                  </div>
                  <span className="font-semibold">{stats.availableTables}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Ocupadas</span>
                  </div>
                  <span className="font-semibold">{stats.occupiedTables}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <span>Reservadas</span>
                  </div>
                  <span className="font-semibold">{stats.reservedTables}</span>
                </div>
              </div>
            </ChartCard>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BellIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Alertas
              </h3>
              <div className="space-y-3">
                {stats.lowStockItems > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          Stock Bajo
                        </p>
                        <p className="text-xs text-red-600">
                          {stats.lowStockItems} productos con stock bajo
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {stats.pendingPaymentCount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Pagos Pendientes
                        </p>
                        <p className="text-xs text-amber-600">
                          {stats.pendingPaymentCount} pagos por verificar
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.readyOrders > 0 && user?.role === 'waiter' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Órdenes Listas
                        </p>
                        <p className="text-xs text-green-600">
                          {stats.readyOrders} órdenes listas para entregar
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.lowStockItems === 0 && stats.pendingPaymentCount === 0 && 
                 (user?.role !== 'waiter' || stats.readyOrders === 0) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Todo en orden
                        </p>
                        <p className="text-xs text-green-600">
                          No hay alertas pendientes
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                Métricas
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Eficiencia de Órdenes</span>
                    <span className="font-medium">
                      {stats.totalOrders > 0 
                        ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stats.totalOrders > 0 
                          ? (stats.deliveredOrders / stats.totalOrders) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Ocupación de Mesas</span>
                    <span className="font-medium">
                      {stats.totalTables > 0 
                        ? Math.round((stats.occupiedTables / stats.totalTables) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stats.totalTables > 0 
                          ? (stats.occupiedTables / stats.totalTables) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Stock Saludable</span>
                      <span className="font-medium">
                        {stats.totalItems > 0 
                          ? Math.round(((stats.totalItems - stats.lowStockItems) / stats.totalItems) * 100)
                          : 100}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.totalItems > 0 
                            ? ((stats.totalItems - stats.lowStockItems) / stats.totalItems) * 100 
                            : 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <RocketLaunchIcon className="h-5 w-5 text-purple-500 mr-2" />
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'admin' && (
              <>
                <a
                  href="/inventory"
                  className="group relative bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ArchiveBoxIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Inventario</p>
                      <p className="text-xs text-purple-700">Gestionar productos</p>
                    </div>
                  </div>
                </a>
                <a
                  href="/users"
                  className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Usuarios</p>
                      <p className="text-xs text-blue-700">Gestionar personal</p>
                    </div>
                  </div>
                </a>
              </>
            )}
            
            {(user?.role === 'bar' || user?.role === 'admin') && (
              <>
                <a
                  href="/orders"
                  className="group relative bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4 hover:from-amber-100 hover:to-amber-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Órdenes</p>
                      <p className="text-xs text-amber-700">Confirmar pedidos</p>
                    </div>
                  </div>
                </a>
                <a
                  href="/payments"
                  className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CreditCardIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Pagos</p>
                      <p className="text-xs text-green-700">Verificar pagos</p>
                    </div>
                  </div>
                </a>
              </>
            )}

            {user?.role === 'waiter' && (
              <>
                <a
                  href="/tables"
                  className="group relative bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <TableCellsIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">Mis Mesas</p>
                      <p className="text-xs text-indigo-700">Gestionar mesas</p>
                    </div>
                  </div>
                </a>
                <a
                  href="/orders"
                  className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 hover:from-green-100 hover:to-green-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900">Órdenes Listas</p>
                      <p className="text-xs text-green-700">Para entregar</p>
                    </div>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Items Analytics Section - Only for Admin and Bar */}
        {(user?.role === 'admin' || user?.role === 'bar') && itemsStats && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Análisis de Productos</h2>
              <p className="text-gray-600">Insights detallados sobre el rendimiento de tus productos</p>
            </div>

            {/* Top Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <TopItemsCard
                title="Más Vendidos"
                items={itemsStats.mostSoldItems}
                type="best"
              />
              
              <TopItemsCard
                title="Menos Vendidos"
                items={itemsStats.leastSoldItems}
                type="worst"
              />

              <TopItemsCard
                title="Más Rentables"
                items={itemsStats.profitabilityAnalysis}
                type="profitable"
              />

              <TopItemsCard
                title="Tendencias"
                items={itemsStats.recentTrends}
                type="trending"
              />
            </div>

            {/* Categories and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Categories Performance */}
              <ChartCard title="Rendimiento por Categorías" subtitle="Ventas por tipo de producto">
                <CategoriesChart data={itemsStats.itemsByCategory} />
              </ChartCard>

              {/* Never Sold Items Alert */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Productos Sin Vender
                </h3>
                
                {itemsStats.neverSoldItems && itemsStats.neverSoldItems.length > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800 font-medium">
                        {itemsStats.neverSoldItems.length} productos nunca han sido vendidos
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Considera revisar precios, promociones o eliminar del menú
                      </p>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {itemsStats.neverSoldItems.slice(0, 8).map((item: { id: number; name: string; category: string; sale_price: number; stock: number }) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-600 capitalize">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">${item.sale_price}</p>
                            <p className="text-xs text-gray-600">Stock: {item.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {itemsStats.neverSoldItems.length > 8 && (
                      <p className="text-center text-sm text-gray-500 mt-3">
                        Y {itemsStats.neverSoldItems.length - 8} productos más...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          ¡Excelente!
                        </p>
                        <p className="text-xs text-green-600">
                          Todos los productos han sido vendidos al menos una vez
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profitability Insights */}
            {itemsStats.profitabilityAnalysis && itemsStats.profitabilityAnalysis.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💎</span>
                  Insights de Rentabilidad
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${itemsStats.profitabilityAnalysis[0]?.total_profit?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-gray-600">Producto más rentable</p>
                    <p className="text-xs font-medium text-gray-900 mt-1">
                      {itemsStats.profitabilityAnalysis[0]?.name || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {itemsStats.profitabilityAnalysis[0]?.profit_margin?.toFixed(1) || '0'}%
                    </p>
                    <p className="text-sm text-gray-600">Mejor margen</p>
                    <p className="text-xs text-gray-500 mt-1">Promedio del top producto</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {itemsStats.profitabilityAnalysis.reduce((sum: number, item: ItemData) => sum + (item.total_profit || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Ganancia total</p>
                    <p className="text-xs text-gray-500 mt-1">Top 10 productos</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
      </div>
    </Layout>
  );
}
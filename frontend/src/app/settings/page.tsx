'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType;
}

function GeneralSettings() {
  const [settings, setSettings] = useState({
    barName: 'BarFlow Nightclub',
    timezone: 'UTC-5',
    currency: 'USD',
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure basic application settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bar Name</label>
          <input
            type="text"
            value={settings.barName}
            onChange={(e) => setSettings({ ...settings, barName: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="UTC-5">UTC-5 (EST)</option>
            <option value="UTC-6">UTC-6 (CST)</option>
            <option value="UTC-7">UTC-7 (MST)</option>
            <option value="UTC-8">UTC-8 (PST)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    paymentAlerts: true,
    lowStockAlerts: true,
    emailNotifications: false,
    smsNotifications: false
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure when and how you receive notifications
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(key as keyof typeof notifications)}
              className={`${
                value ? 'bg-purple-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  value ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [security, setSecurity] = useState({
    sessionTimeout: '30',
    passwordPolicy: 'medium',
    twoFactorAuth: false,
    loginAttempts: '5'
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure security and authentication settings
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
          <input
            type="number"
            value={security.sessionTimeout}
            onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
          <input
            type="number"
            value={security.loginAttempts}
            onChange={(e) => setSecurity({ ...security, loginAttempts: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password Policy</label>
          <select
            value={security.passwordPolicy}
            onChange={(e) => setSecurity({ ...security, passwordPolicy: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="low">Low (6+ characters)</option>
            <option value="medium">Medium (8+ chars, mixed case)</option>
            <option value="high">High (12+ chars, symbols)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
            <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
          </div>
          <button
            type="button"
            onClick={() => setSecurity({ ...security, twoFactorAuth: !security.twoFactorAuth })}
            className={`${
              security.twoFactorAuth ? 'bg-purple-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  const [system, setSystem] = useState({
    backupFrequency: 'daily',
    logRetention: '30',
    apiRateLimit: '1000',
    maintenanceMode: false
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure system-level settings and maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Backup Frequency</label>
          <select
            value={system.backupFrequency}
            onChange={(e) => setSystem({ ...system, backupFrequency: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Log Retention (days)</label>
          <input
            type="number"
            value={system.logRetention}
            onChange={(e) => setSystem({ ...system, logRetention: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">API Rate Limit (requests/hour)</label>
          <input
            type="number"
            value={system.apiRateLimit}
            onChange={(e) => setSystem({ ...system, apiRateLimit: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
            <p className="text-xs text-gray-500">Block access for maintenance</p>
          </div>
          <button
            type="button"
            onClick={() => setSystem({ ...system, maintenanceMode: !system.maintenanceMode })}
            className={`${
              system.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                system.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
            Create Backup
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">
            Export Data
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md">
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('general');

  const sections: SettingsSection[] = [
    {
      id: 'general',
      title: 'General',
      description: 'Basic application settings',
      icon: Cog6ToothIcon,
      component: GeneralSettings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Alert and notification preferences',
      icon: BellIcon,
      component: NotificationSettings
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Authentication and security settings',
      icon: ShieldCheckIcon,
      component: SecuritySettings
    },
    {
      id: 'system',
      title: 'System',
      description: 'System maintenance and configuration',
      icon: ServerIcon,
      component: SystemSettings
    }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || GeneralSettings;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure system settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Sidebar */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div>{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:max-w-4xl">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8">
                <ActiveComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
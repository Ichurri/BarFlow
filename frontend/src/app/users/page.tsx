'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, tablesApi } from '@/lib/api';
import { formatDate, getRoleColor, cn } from '@/lib/utils';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface UserType {
  id: number;
  username: string;
  role: 'admin' | 'bar' | 'waiter';
  created_at: string;
}

interface CreateUserForm {
  username: string;
  password: string;
  role: 'admin' | 'bar' | 'waiter';
}

interface EditUserForm {
  username?: string;
  password?: string;
  role?: 'admin' | 'bar' | 'waiter';
}

function UserCard({ user }: { user: UserType }) {
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  return (
    <>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {user.username}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getRoleColor(user.role)
                  )}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-500"
                title="Edit user"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              {user.id !== 1 && ( // Don't allow deleting main admin
                <button
                  onClick={handleDelete}
                  disabled={deleteUserMutation.isPending}
                  className="text-red-400 hover:text-red-500 disabled:opacity-50"
                  title="Delete user"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Created</dt>
              <dd className="text-gray-900">{formatDate(user.created_at)}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
      />
    </>
  );
}

function CreateUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    password: '',
    role: 'waiter'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserForm) => usersApi.create(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
      setFormData({ username: '', password: '', role: 'waiter' });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create user');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createUserMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="waiter">Waiter</option>
                <option value="bar">Bar Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: UserType }) {
  const [formData, setFormData] = useState<EditUserForm>({
    username: user.username,
    password: '',
    role: user.role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Fetch all tables for assignment
  const { data: allTables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getAll,
    enabled: isOpen && user.role === 'waiter'
  });

  // Fetch waiter info if user is a waiter
  const { data: waiterInfo } = useQuery({
    queryKey: ['waiter-info', user.id],
    queryFn: () => usersApi.getWaiterInfo(user.id),
    enabled: isOpen && user.role === 'waiter'
  });

  // Update selected tables when waiter info is loaded
  useEffect(() => {
    if (waiterInfo?.tables) {
      setSelectedTables(waiterInfo.tables.map((table: any) => table.id));
    }
  }, [waiterInfo]);

  // Clear selected tables when role changes to non-waiter
  useEffect(() => {
    if (formData.role !== 'waiter') {
      setSelectedTables([]);
    }
  }, [formData.role]);

  const updateUserMutation = useMutation({
    mutationFn: (userData: EditUserForm) => {
      // Remove empty password from update data
      const updateData = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }
      return usersApi.update(user.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update user');
    }
  });

  const assignTablesMutation = useMutation({
    mutationFn: (tableIds: number[]) => usersApi.assignTablesToWaiter(user.id, tableIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-info', user.id] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to assign tables');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Update user info
      await updateUserMutation.mutateAsync(formData);
      
      // If user is/becomes a waiter, also update table assignments
      if (formData.role === 'waiter') {
        await assignTablesMutation.mutateAsync(selectedTables);
      }
      
      onClose();
    } catch (error) {
      // Error handling is already done in the mutation's onError
    }
  };

  const handleTableToggle = (tableId: number) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
          
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Leave empty to keep current password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="waiter">Waiter</option>
                <option value="bar">Bar Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Table Assignment Section - Only show for waiters */}
            {formData.role === 'waiter' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Assigned Tables
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {allTables.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No tables available
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {allTables.map((table: any) => (
                        <label
                          key={table.id}
                          className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTables.includes(table.id)}
                            onChange={() => handleTableToggle(table.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div className="ml-3 flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {table.qr_code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {table.location} • Cap: {table.capacity}
                            </div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            table.status === 'available' 
                              ? "bg-green-100 text-green-800"
                              : table.status === 'occupied'
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          )}>
                            {table.status}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select tables to assign to this waiter
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending || assignTablesMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
              >
                {(updateUserMutation.isPending || assignTablesMutation.isPending) 
                  ? 'Updating...' 
                  : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
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

  // Group users by role
  const usersByRole = users?.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {} as Record<string, UserType[]>) || {};

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage staff accounts and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <div key={role} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'h-8 w-8 rounded-md flex items-center justify-center',
                      role === 'admin' ? 'bg-purple-500' :
                      role === 'bar' ? 'bg-blue-500' : 'bg-green-500'
                    )}>
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {role.charAt(0).toUpperCase() + role.slice(1)} Staff
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {roleUsers.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Users List */}
        {users && users.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new user account.
            </p>
          </div>
        )}

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </Layout>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  LockClosedIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password')
});

const notificationSchema = yup.object({
  emailNotifications: yup.boolean(),
  smsNotifications: yup.boolean(),
  pushNotifications: yup.boolean(),
  marketingEmails: yup.boolean(),
  listingUpdates: yup.boolean(),
  messages: yup.boolean(),
  priceAlerts: yup.boolean()
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;
type NotificationFormData = yup.InferType<typeof notificationSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('password');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema)
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: yupResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      listingUpdates: true,
      messages: true,
      priceAlerts: true
    }
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      await axios.put('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormData) => {
    setIsLoading(true);
    try {
      await axios.put('/users/notifications', data);
      toast.success('Notification preferences updated successfully');
    } catch (error: any) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
      return;
    }

    try {
      await axios.delete('/users/profile');
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'password', name: 'Password & Security', icon: LockClosedIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon }
  ];

  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <button onClick={() => router.back()} className="text-gray-700 hover:text-[#0A0F2C]">
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-[#0A0F2C]">Account Settings</h1>
              <div></div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === tab.id
                            ? 'bg-[#0A0F2C] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {tab.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Password & Security Tab */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
                    
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('currentPassword')}
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('newPassword')}
                            type={showNewPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C]"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2 bg-[#0A0F2C] text-white rounded-md hover:opacity-90 disabled:opacity-50"
                        >
                          {isLoading ? <LoadingSpinner size="sm" /> : 'Update Password'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Currently disabled
                        </p>
                      </div>
                      <Button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>

                  {/* Login Sessions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-500">Chrome on Windows • Mumbai, India</p>
                        </div>
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                    <Button className="mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Sign out all other sessions
                    </Button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <input
                          {...notificationForm.register('emailNotifications')}
                          type="checkbox"
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                        </div>
                        <input
                          {...notificationForm.register('smsNotifications')}
                          type="checkbox"
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                        </div>
                        <input
                          {...notificationForm.register('pushNotifications')}
                          type="checkbox"
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Specific Notifications</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Listing Updates</h5>
                              <p className="text-sm text-gray-600">When your listings get views, favorites, or messages</p>
                            </div>
                            <input
                              {...notificationForm.register('listingUpdates')}
                              type="checkbox"
                              className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Messages</h5>
                              <p className="text-sm text-gray-600">When you receive new messages from buyers</p>
                            </div>
                            <input
                              {...notificationForm.register('messages')}
                              type="checkbox"
                              className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Price Alerts</h5>
                              <p className="text-sm text-gray-600">When similar items are listed at lower prices</p>
                            </div>
                            <input
                              {...notificationForm.register('priceAlerts')}
                              type="checkbox"
                              className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Marketing Emails</h5>
                              <p className="text-sm text-gray-600">Promotional content and tips</p>
                            </div>
                            <input
                              {...notificationForm.register('marketingEmails')}
                              type="checkbox"
                              className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-[#0A0F2C] text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : 'Save Preferences'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Profile Visibility</h4>
                          <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                          <p className="text-sm text-gray-600">Show contact details on your listings</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Activity Status</h4>
                          <p className="text-sm text-gray-600">Show when you were last active</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#0A0F2C] focus:ring-[#0A0F2C] border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a copy of your data including listings, messages, and account information.
                    </p>
                    <Button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Request Data Export
                    </Button>
                  </div>

                  {/* Account Deletion */}
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Delete Account</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


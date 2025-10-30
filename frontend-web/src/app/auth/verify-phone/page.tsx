'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const phoneVerificationSchema = yup.object({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required')
});

type PhoneVerificationFormData = yup.InferType<typeof phoneVerificationSchema>;

export default function VerifyPhonePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { verifyPhone, resendPhoneOTP, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PhoneVerificationFormData>({
    resolver: yupResolver(phoneVerificationSchema)
  });

  const onSubmit = async (data: PhoneVerificationFormData) => {
    setIsLoading(true);
    try {
      await verifyPhone(data.otp);
      toast.success('Phone number verified successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendPhoneOTP();
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0A0F2C]">ClicktoSell</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verify your phone number
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-gray-900">
              {user?.phone ? `+91 ${user.phone}` : 'your phone number'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1">
                <input
                  {...register('otp')}
                  type="text"
                  maxLength={6}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0A0F2C] focus:border-[#0A0F2C] sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFD100] hover:bg-[#FFD100]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0F2C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Verify Phone Number'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="font-medium text-[#0A0F2C] hover:text-[#0A0F2C]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/dashboard"
                className="font-medium text-[#0A0F2C] hover:text-[#0A0F2C]/80"
              >
                Skip for now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


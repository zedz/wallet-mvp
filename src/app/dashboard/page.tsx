export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 下面是你原本的代码


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { WalletSection } from '@/components/wallet-section';
import { BalancesSection } from '@/components/balances-section';
import { SendSection } from '@/components/send-section';
import { TransfersSection } from '@/components/transfers-section';
import { CardSection } from '@/components/card-section';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      toast.error('Logout failed');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Wallet MVP
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <WalletSection />
            <BalancesSection />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <SendSection />
            <CardSection />
          </div>
          
          <TransfersSection />
        </div>
      </div>
    </div>
  );
}

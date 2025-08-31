'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface WalletInfo {
  ethAddress?: string;
  xrpAddress?: string;
  initialized: boolean;
}

export function WalletSection() {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading } = useQuery<WalletInfo>({
    queryKey: ['wallet'],
    queryFn: async () => {
      try {
        const response = await axios.post('/api/wallet/init');
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          throw new Error('Please log in');
        }
        throw error;
      }
    },
    retry: false,
  });

  const initWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/wallet/init');
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['wallet'], data);
      toast.success('Wallet initialized successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to initialize wallet';
      toast.error(message);
    },
  });

  const handleInitializeWallet = () => {
    initWalletMutation.mutate();
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          My Addresses
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : wallet?.initialized ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Ethereum Address (Sepolia)
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {wallet.ethAddress}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                XRP Address (Testnet)
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {wallet.xrpAddress}
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                ✅ Wallet initialized. Addresses are masked for security.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Initialize your wallet to get started
            </p>
            <button
              onClick={handleInitializeWallet}
              disabled={initWalletMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {initWalletMutation.isPending ? 'Initializing...' : 'Initialize Wallet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
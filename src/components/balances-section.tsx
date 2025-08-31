'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Balances {
  eth?: string;
  xrp?: string;
  usdc?: string;
  usdt?: string;
}

export function BalancesSection() {
  const [activeTab, setActiveTab] = useState<'native' | 'stablecoins'>('stablecoins');

  const { data: nativeBalances, isLoading: nativeLoading, refetch: refetchNative } = useQuery<Balances>({
    queryKey: ['balances', 'native'],
    queryFn: async () => {
      const response = await axios.get('/api/wallet/balances');
      return response.data;
    },
    enabled: activeTab === 'native',
  });

  const { data: usdcData, isLoading: usdcLoading, refetch: refetchUSDC } = useQuery({
    queryKey: ['balances', 'usdc'],
    queryFn: async () => {
      const response = await axios.get('/api/usdc/balance');
      return response.data;
    },
    enabled: activeTab === 'stablecoins',
  });

  const { data: usdtData, isLoading: usdtLoading, refetch: refetchUSDT } = useQuery({
    queryKey: ['balances', 'usdt'],
    queryFn: async () => {
      const response = await axios.get('/api/usdt/balance');
      return response.data;
    },
    enabled: activeTab === 'stablecoins',
  });

  const handleRefresh = () => {
    if (activeTab === 'native') {
      refetchNative();
    } else {
      refetchUSDC();
      refetchUSDT();
    }
    toast.success('Balances refreshed');
  };

  const tabs = [
    { id: 'stablecoins' as const, name: 'Stablecoins' },
    { id: 'native' as const, name: 'Native Tokens' },
  ];

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Balances
          </h3>
          <button
            onClick={handleRefresh}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Refresh
          </button>
        </div>

        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'stablecoins' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">$</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">USDC</p>
                    <p className="text-xs text-gray-500">USD Coin</p>
                  </div>
                </div>
                <div className="text-right">
                  {usdcLoading ? (
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">
                      ${usdcData?.balance || '0.00'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">T</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">USDT</p>
                    <p className="text-xs text-gray-500">Tether USD</p>
                  </div>
                </div>
                <div className="text-right">
                  {usdtLoading ? (
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">
                      ${usdtData?.balance || '0.00'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'native' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Ξ</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">ETH</p>
                    <p className="text-xs text-gray-500">Ethereum (Sepolia)</p>
                  </div>
                </div>
                <div className="text-right">
                  {nativeLoading ? (
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">
                      {nativeBalances?.eth || '0.00'} ETH
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">X</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">XRP</p>
                    <p className="text-xs text-gray-500">Ripple (Testnet)</p>
                  </div>
                </div>
                <div className="text-right">
                  {nativeLoading ? (
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">
                      {nativeBalances?.xrp || '0.00'} XRP
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
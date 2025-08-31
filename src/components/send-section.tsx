'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';

type SendType = 'USDC' | 'USDT' | 'XRP';

export function SendSection() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SendType>('USDC');
  const [formData, setFormData] = useState({
    toAddress: '',
    amount: '',
    label: '',
  });

  const sendMutation = useMutation({
    mutationFn: async ({ type, data }: { type: SendType; data: any }) => {
      const endpoints = {
        USDC: '/api/usdc/send',
        USDT: '/api/usdt/send',
        XRP: '/api/xrp/send',
      };
      // XRP 接口使用 amountXrp
      const payload = type === 'XRP'
        ? { ...data, amountXrp: data.amount }
        : data;

      const response = await axios.post(endpoints[type], payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success(`${activeTab} sent successfully`);
      setFormData({ toAddress: '', amount: '', label: '' });
      // 刷新余额与交易列表
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || `Failed to send ${activeTab}`;
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.toAddress || !formData.amount) {
      toast.error('Please fill in required fields');
      return;
    }
    sendMutation.mutate({
      type: activeTab,
      data: formData,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const tabs: SendType[] = ['USDC', 'USDT', 'XRP'];

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Send Assets
        </h3>

        {/* Tabs */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as SendType)}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {tabs.map((tab) => (
              <option key={tab} value={tab}>
                {tab}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">
              Recipient Address *
            </label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              value={formData.toAddress}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`Enter ${activeTab} address`}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount *
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="block w-full pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{activeTab}</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700">
              Label (Optional)
            </label>
            <input
              type="text"
              id="label"
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Transaction description"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sendMutation.isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {sendMutation.isPending ? `Sending ${activeTab}...` : `Send ${activeTab}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

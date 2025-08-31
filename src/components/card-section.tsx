'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Card {
  id: string;
  providerType: string;
  last4: string;
  expiry: string;
  balance: string;
  status: string;
  createdAt: string;
}

export function CardSection() {
  const queryClient = useQueryClient();
  const [issueAmount, setIssueAmount] = useState('');

  const { data: cards, isLoading } = useQuery<{ cards: Card[] }>({
    queryKey: ['cards'],
    queryFn: async () => {
      const response = await axios.get('/api/card/me');
      return response.data;
    },
  });

  const issueCardMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await axios.post('/api/card/issue', { amount });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Demo card issued successfully');
      setIssueAmount('');
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to issue card';
      toast.error(message);
    },
  });

  const handleIssueCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueAmount || parseFloat(issueAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    issueCardMutation.mutate(issueAmount);
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Visa Prepaid Cards (Demo)
        </h3>

        {cards?.cards?.length ? (
          <div className="space-y-4">
            {cards.cards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-90">Demo Prepaid Card</p>
                    <p className="text-lg font-mono mt-1">
                      •••• •••• •••• {card.last4}
                    </p>
                    <div className="flex space-x-4 mt-2 text-sm">
                      <div>
                        <p className="opacity-75">EXPIRES</p>
                        <p className="font-medium">{card.expiry}</p>
                      </div>
                      <div>
                        <p className="opacity-75">BALANCE</p>
                        <p className="font-medium">${card.balance}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-75">STATUS</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      card.status === 'ACTIVE' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              No cards issued yet
            </p>
          </div>
        )}

        <form onSubmit={handleIssueCard} className="mt-6 space-y-4">
          <div>
            <label htmlFor="issueAmount" className="block text-sm font-medium text-gray-700">
              Issue New Demo Card
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                id="issueAmount"
                value={issueAmount}
                onChange={(e) => setIssueAmount(e.target.value)}
                className="block w-full pl-7 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="100.00"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={issueCardMutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {issueCardMutation.isPending ? 'Issuing Card...' : 'Issue Demo Card'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ This is a demo implementation. Real card integration would require PCI compliance and proper security measures.
          </p>
        </div>
      </div>
    </div>
  );
}
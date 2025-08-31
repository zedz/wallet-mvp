'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Providers from '@/components/providers';
import WalletSection from '@/components/wallet-section';
import BalancesSection from '@/components/balances-section';
import SendSection from '@/components/send-section';
import TransfersSection from '@/components/transfers-section';
import CardSection from '@/components/card-section';

export default function DashboardPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your wallets, balances, transfers and prepaid card.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <WalletSection />
              <BalancesSection />
            </div>

            <div className="space-y-6">
              <SendSection />
              <CardSection />
            </div>
          </section>

          <section className="pt-2">
            <TransfersSection />
          </section>
        </div>
      </main>
    </Providers>
  );
}

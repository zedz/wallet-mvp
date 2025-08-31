import { env } from '@/config/env';
import { GiftbitClient } from './giftbit.client';
import { GiftbitSimulation } from './giftbit.sim';

export function getGiftbitClient() {
  if (env.USE_SIMULATION || !env.GIFTBIT_API_KEY || !env.GIFTBIT_API_BASE) {
    return new GiftbitSimulation();
  }
  
  return new GiftbitClient();
}

export type { GiftbitCard, CardTopup } from './giftbit.client';
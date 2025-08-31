import { env } from '@/config/env';
import { CircleClient } from './circle.client';
import { CircleSimulation } from './circle.sim';

export function getCircleClient() {
  if (env.USE_SIMULATION || !env.CIRCLE_API_KEY) {
    return new CircleSimulation();
  }
  
  return new CircleClient();
}

export type { CircleWallet, CircleTransfer } from './circle.client';
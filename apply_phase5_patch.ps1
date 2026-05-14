# Create folders
New-Item -ItemType Directory -Force -Path src/config
New-Item -ItemType Directory -Force -Path src/store

# storeConfig.ts
@"
export const STORE_CONFIG = {
  gems: [
    { id: 'gems_100', amount: 100, price: 0.99 },
    { id: 'gems_250', amount: 250, price: 1.99 },
    { id: 'gems_700', amount: 700, price: 4.99 },
    { id: 'gems_1500', amount: 1500, price: 9.99 },
  ],
  tickets: [
    { id: 'tickets_small', amount: 5, cost: 50 },
    { id: 'tickets_medium', amount: 15, cost: 120 },
    { id: 'tickets_large', amount: 40, cost: 300 },
  ],
  boosts: [
    { id: 'boost_xp', type: 'xp', multiplier: 2, duration: 1800, cost: 80 },
    { id: 'boost_coins', type: 'coins', multiplier: 2, duration: 1800, cost: 80 },
  ],
  vip: {
    id: 'vip_monthly',
    price: 4.99,
  }
};
"@ | Set-Content src/config/storeConfig.ts

# entitlementStore.ts
@"
import { create } from 'zustand';

export const useEntitlementStore = create((set) => ({
  vipExpiresAt: 0,
  boosts: {},

  activateVIP: (durationMs) => {
    set({ vipExpiresAt: Date.now() + durationMs });
  },

  activateBoost: (type, multiplier, duration) => {
    set((state) => ({
      boosts: {
        ...state.boosts,
        [type]: {
          multiplier,
          expiresAt: Date.now() + duration * 1000
        }
      }
    }));
  }
}));
"@ | Set-Content src/store/entitlementStore.ts

# purchaseStore.ts
@"
import { create } from 'zustand';
import { STORE_CONFIG } from '../config/storeConfig';
import { usePlayerStore } from './usePlayerStore';
import { useEntitlementStore } from './entitlementStore';

export const usePurchaseStore = create(() => ({
  buy: (productId) => {
    const player = usePlayerStore.getState();
    const ent = useEntitlementStore.getState();

    const gem = STORE_CONFIG.gems.find(g => g.id === productId);
    if (gem) {
      player.addGems(gem.amount);
      return;
    }

    const ticket = STORE_CONFIG.tickets.find(t => t.id === productId);
    if (ticket) {
      if (player.coins < ticket.cost) return;
      player.addCoins(-ticket.cost);
      player.addTickets(ticket.amount);
      return;
    }

    const boost = STORE_CONFIG.boosts.find(b => b.id === productId);
    if (boost) {
      if (player.gems < boost.cost) return;
      player.addGems(-boost.cost);
      ent.activateBoost(boost.type, boost.multiplier, boost.duration);
      return;
    }

    if (productId === STORE_CONFIG.vip.id) {
      ent.activateVIP(30 * 24 * 60 * 60 * 1000);
    }
  }
}));
"@ | Set-Content src/store/purchaseStore.ts

Write-Host "Phase 5 patch applied successfully!"
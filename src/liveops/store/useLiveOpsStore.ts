// src/liveops/store/useLiveOpsStore.ts

import { create } from 'zustand';
import type { LiveOp, LiveOpStatus } from '../types';

function getStatus(now: number, startsAt: number, endsAt: number): LiveOpStatus {
  if (now < startsAt) return 'upcoming';
  if (now > endsAt) return 'ended';
  return 'live';
}

interface LiveOpsState {
  ops: LiveOp[];

  setOps: (items: LiveOp[]) => void;
  refreshStatuses: () => void;

  getLiveOps: () => LiveOp[];
  getUpcomingOps: () => LiveOp[];
  getEndedOps: () => LiveOp[];
}

export const useLiveOpsStore = create<LiveOpsState>((set, get) => ({
  ops: [],

  setOps: (items) => {
    set({ ops: items });
  },

  refreshStatuses: () => {
    const now = Date.now();
    const updated = get().ops.map((op) => ({
      ...op,
      status: getStatus(now, op.startsAt, op.endsAt),
    }));
    set({ ops: updated });
  },

  getLiveOps: () => get().ops.filter((o) => o.status === 'live'),
  getUpcomingOps: () => get().ops.filter((o) => o.status === 'upcoming'),
  getEndedOps: () => get().ops.filter((o) => o.status === 'ended'),
}));


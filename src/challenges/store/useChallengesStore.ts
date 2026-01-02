// src/challenges/store/useChallengesStore.ts

import { create } from 'zustand';
import type { Challenge, ChallengePlayer } from '../types';
import { saveItem, StorageKeys } from '../../storage/storage';
import { getTodayKey } from '../../liveops/utils/time';
import { useProfileStore } from '../../profile/store/useProfileStore';

interface ChallengesState {
  incoming: Challenge[];
  active: Challenge[];
  history: Challenge[];

  setIncoming: (items: Challenge[]) => void;

  acceptChallenge: (id: string) => void;
  declineChallenge: (id: string) => void;
  completeChallenge: (
    id: string,
    myScore: number,
    opponentScore: number
  ) => void;

  /** PHASE 11.1 */
  ensureTodayDailyChallenge: () => void;

  /** PHASE 11.2 */
  getTodayDailyChallenge: () => Challenge | null;
    /** PHASE 11.4 */
  hasClaimedTodayReward: () => boolean;
  markTodayRewardClaimed: () => void;

}

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  incoming: [],
  active: [],
  history: [],

  setIncoming: (items) => {
    set({ incoming: items });

    saveItem(StorageKeys.CHALLENGES, {
      incoming: items,
      active: get().active,
      history: get().history,
    });
  },

  acceptChallenge: (id) => {
    const { incoming, active, history } = get();
    const challenge = incoming.find((c) => c.id === id);
    if (!challenge) return;

    const updatedIncoming = incoming.filter((c) => c.id !== id);
    const updatedActive = [...active, { ...challenge, status: 'active' }];

    set({
      incoming: updatedIncoming,
      active: updatedActive,
    });

    saveItem(StorageKeys.CHALLENGES, {
      incoming: updatedIncoming,
      active: updatedActive,
      history,
    });
  },

  declineChallenge: (id) => {
    const { incoming, history, active } = get();
    const challenge = incoming.find((c) => c.id === id);
    if (!challenge) return;

    const updatedIncoming = incoming.filter((c) => c.id !== id);
    const updatedHistory = [...history, { ...challenge, status: 'declined' }];

    set({
      incoming: updatedIncoming,
      history: updatedHistory,
    });

    saveItem(StorageKeys.CHALLENGES, {
      incoming: updatedIncoming,
      active,
      history: updatedHistory,
    });
  },

  completeChallenge: (id, myScore, opponentScore) => {
    const { active, history, incoming } = get();
    const challenge = active.find((c) => c.id === id);
    if (!challenge) return;

    const updatedActive = active.filter((c) => c.id !== id);
    const updatedHistory = [
      ...history,
      {
        ...challenge,
        status: 'completed',
        myScore,
        opponentScore,
      },
    ];

    set({
      active: updatedActive,
      history: updatedHistory,
    });

    saveItem(StorageKeys.CHALLENGES, {
      incoming,
      active: updatedActive,
      history: updatedHistory,
    });
        // ===============================
    // PHASE 11.4 — DAILY REWARD GRANT
    // ===============================
    if (
      challenge.type === 'daily' &&
      !get().hasClaimedTodayReward()
    ) {
      useProfileStore.getState().grantDailyReward();
      get().markTodayRewardClaimed();
    }

  },

  /** ===============================
   *  PHASE 11.1 — DAILY AUTO-CREATE
   *  =============================== */
  ensureTodayDailyChallenge: () => {
    const { active, incoming, history } = get();
    const todayKey = getTodayKey();

    const alreadyExists =
      active.some((c) => c.type === 'daily' && c.dayKey === todayKey) ||
      history.some((c) => c.type === 'daily' && c.dayKey === todayKey);

    if (alreadyExists) return;

    const systemPlayer: ChallengePlayer = {
      id: 'system',
      username: 'Daily Challenge',
    };

    const dailyChallenge: Challenge = {
      id: `daily-${todayKey}`,
      type: 'daily',
      dayKey: todayKey,
      status: 'active',
      createdAt: Date.now(),
      from: systemPlayer,
      to: systemPlayer,
      category: 'daily',
    };

    const updatedActive = [...active, dailyChallenge];

    set({ active: updatedActive });

    saveItem(StorageKeys.CHALLENGES, {
      incoming,
      active: updatedActive,
      history,
    });
  },

  /** ===============================
   *  PHASE 11.2 — TODAY SELECTOR
   *  =============================== */
  getTodayDailyChallenge: () => {
    const { active, history } = get();
    const todayKey = getTodayKey();

    return (
      active.find((c) => c.type === 'daily' && c.dayKey === todayKey) ||
      history.find((c) => c.type === 'daily' && c.dayKey === todayKey) ||
      null
    );
  },
    /** ===============================
   *  PHASE 11.4 — REWARD GUARD
   *  =============================== */
  hasClaimedTodayReward: () => {
    const todayKey = getTodayKey();
    const { history } = get();

    return history.some(
      (c) =>
        c.type === 'daily' &&
        c.dayKey === todayKey &&
        c.rewardClaimed === true
    );
  },

  markTodayRewardClaimed: () => {
    const todayKey = getTodayKey();
    const { history, incoming, active } = get();

    const updatedHistory = history.map((c) =>
      c.type === 'daily' && c.dayKey === todayKey
        ? { ...c, rewardClaimed: true }
        : c
    );

    set({ history: updatedHistory });

    saveItem(StorageKeys.CHALLENGES, {
      incoming,
      active,
      history: updatedHistory,
    });
  },

}));

// src/challenges/store/useChallengesStore.ts

import { create } from 'zustand';
import type { Challenge, ChallengePlayer, ChallengeStatus } from '../types';
import { saveItem, StorageKeys } from '../../storage/storage';
import { getTodayKey } from '../../liveops/utils/time';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { auth, db } from '@/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { notifyChallengeWaiting } from '@/notifications/challengeNotifications';

type ChallengeResult = 'win' | 'loss' | 'draw' | 'waiting';

type ChallengeStatePayload = {
  incoming: Challenge[];
  active: Challenge[];
  history: Challenge[];
  rewardedChallengeIds?: string[];
};


type ChallengeDoc = {
  from?: string;
  to?: string;
  fromUsername?: string;
  toUsername?: string;
  category?: string;
  createdAt?: number;
  expiresAt?: number;
  winner?: string;
  scores?: Record<string, number>;
  completedAtBy?: Record<string, number>;
};

interface ChallengesState {
  incoming: Challenge[];
  active: Challenge[];
  history: Challenge[];
  rewardedChallengeIds: string[];

  setIncoming: (items: Challenge[]) => void;
  loadRemoteChallenges: () => Promise<void>;
  subscribeRemoteChallenges: () => Unsubscribe;

  acceptChallenge: (id: string) => Promise<void>;
  declineChallenge: (id: string) => Promise<void>;
  completeChallenge: (
    id: string,
    myScore: number,
    opponentScore?: number
  ) => Promise<void>;

  ensureTodayDailyChallenge: () => void;
  getTodayDailyChallenge: () => Challenge | null;
  hasClaimedTodayReward: () => boolean;
  markTodayRewardClaimed: () => void;
}

const saveChallenges = (state: ChallengeStatePayload) => {
  saveItem(StorageKeys.CHALLENGES, state);
};

const dedupeById = (items: Challenge[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const isExpired = (data: ChallengeDoc | null | undefined) => {
  const expiresAt = typeof data?.expiresAt === 'number' ? data.expiresAt : null;
  return !!expiresAt && expiresAt <= Date.now();
};

const getOpponentUid = (data: ChallengeDoc | null | undefined, myUid: string | null) => {
  if (!myUid) return null;
  if (data?.from === myUid) return data?.to ?? null;
  if (data?.to === myUid) return data?.from ?? null;
  return null;
};

const getChallengeResult = (myScore: number, opponentScore: number): ChallengeResult => {
  if (myScore > opponentScore) return 'win';
  if (myScore < opponentScore) return 'loss';
  return 'draw';
};

const toChallenge = (
  id: string,
  data: ChallengeDoc,
  status: ChallengeStatus,
  myUid?: string | null
): Challenge => {
  const scores = data?.scores ?? {};
  const opponentUid = getOpponentUid(data, myUid ?? null);
  const myScore = myUid ? scores?.[myUid] ?? 0 : 0;
  const opponentScore = opponentUid ? scores?.[opponentUid] ?? 0 : 0;
  const result = status === 'completed' ? getChallengeResult(myScore, opponentScore) : 'waiting';

  return {
    id,
    from: {
      id: data.from,
      username: data.fromUsername || 'Friend',
    },
    to: {
      id: data.to,
      username: data.toUsername || 'You',
    },
    category: data.category || 'General Knowledge',
    createdAt: data.createdAt || Date.now(),
    status,
    myScore,
    opponentScore,
    result,
    winner: data.winner,
    expiresAt: data.expiresAt,
  } as any;
};

const getRewardForResult = (result: ChallengeResult) => {
  if (result === 'win') return { xp: 35, coins: 12, gems: 0, tickets: 0 };
  if (result === 'draw') return { xp: 18, coins: 6, gems: 0, tickets: 0 };
  if (result === 'loss') return { xp: 8, coins: 2, gems: 0, tickets: 0 };
  return { xp: 0, coins: 0, gems: 0, tickets: 0 };
};

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  incoming: [],
  active: [],
  history: [],
  rewardedChallengeIds: [],

  setIncoming: (items) => {
    const incoming = dedupeById(items);

    set({ incoming });

    saveChallenges({
      incoming,
      active: get().active,
      history: get().history,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },

  loadRemoteChallenges: async () => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    const incomingQuery = query(
      collection(db, 'challenge_requests'),
      where('to', '==', myUid),
      where('status', '==', 'incoming')
    );

    const activeQuery = query(
      collection(db, 'challenge_requests'),
      where('users', 'array-contains', myUid),
      where('status', '==', 'active')
    );

    const completedQuery = query(
      collection(db, 'challenge_requests'),
      where('users', 'array-contains', myUid),
      where('status', '==', 'completed')
    );

    const [incomingSnap, activeSnap, completedSnap] = await Promise.all([
      getDocs(incomingQuery),
      getDocs(activeQuery),
      getDocs(completedQuery),
    ]);

    const remoteIncoming = incomingSnap.docs
      .filter((snap) => !isExpired(snap.data()))
      .map((snap) => toChallenge(snap.id, snap.data(), 'incoming', myUid));

    const remoteActive = activeSnap.docs
      .filter((snap) => {
        const data = snap.data() as ChallengeDoc;
        return !isExpired(data) && !data.completedAtBy?.[myUid];
      })
      .map((snap) => toChallenge(snap.id, snap.data(), 'active', myUid));

    const remoteCompleted = completedSnap.docs.map((snap) =>
      toChallenge(snap.id, snap.data(), 'completed', myUid)
    );

    const localDailyActive = get().active.filter((c) => c.type === 'daily');

    const incoming = dedupeById(remoteIncoming);
    const active = dedupeById([...localDailyActive, ...remoteActive]);
    const history = dedupeById([...remoteCompleted, ...get().history]);

    set({ incoming, active, history });

    saveChallenges({
      incoming,
      active,
      history,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },

  subscribeRemoteChallenges: () => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return () => {};

    let incomingDocs: QueryDocumentSnapshot[] = [];
    let activeDocs: QueryDocumentSnapshot[] = [];
    let completedDocs: QueryDocumentSnapshot[] = [];
    let lastIncomingIds = new Set(get().incoming.map((c) => c.id));

    const syncState = () => {
      const remoteIncoming = incomingDocs
        .filter((snap) => !isExpired(snap.data()))
        .map((snap) => toChallenge(snap.id, snap.data(), 'incoming', myUid));

      const remoteActive = activeDocs
        .filter((snap) => {
          const data = snap.data() as ChallengeDoc;
          return !isExpired(data) && !data.completedAtBy?.[myUid];
        })
        .map((snap) => toChallenge(snap.id, snap.data(), 'active', myUid));

      const remoteCompleted = completedDocs.map((snap) =>
        toChallenge(snap.id, snap.data(), 'completed', myUid)
      );

      const incoming = dedupeById(remoteIncoming);
      const localDailyActive = get().active.filter((c) => c.type === 'daily');
      const active = dedupeById([...localDailyActive, ...remoteActive]);
      const history = dedupeById([...remoteCompleted, ...get().history]);

      const newIncoming = incoming.filter((c) => !lastIncomingIds.has(c.id));
      if (newIncoming.length > 0) {
        void notifyChallengeWaiting(newIncoming.length);
      }
      lastIncomingIds = new Set(incoming.map((c) => c.id));

      set({ incoming, active, history });

      saveChallenges({
        incoming,
        active,
        history,
        rewardedChallengeIds: get().rewardedChallengeIds,
      });
    };

    const incomingQuery = query(
      collection(db, 'challenge_requests'),
      where('to', '==', myUid),
      where('status', '==', 'incoming')
    );

    const activeQuery = query(
      collection(db, 'challenge_requests'),
      where('users', 'array-contains', myUid),
      where('status', '==', 'active')
    );

    const completedQuery = query(
      collection(db, 'challenge_requests'),
      where('users', 'array-contains', myUid),
      where('status', '==', 'completed')
    );

    const unsubIncoming = onSnapshot(incomingQuery, (snap) => {
      incomingDocs = snap.docs;
      syncState();
    });

    const unsubActive = onSnapshot(activeQuery, (snap) => {
      activeDocs = snap.docs;
      syncState();
    });

    const unsubCompleted = onSnapshot(completedQuery, (snap) => {
      completedDocs = snap.docs;
      syncState();
    });

    return () => {
      unsubIncoming();
      unsubActive();
      unsubCompleted();
    };
  },

  acceptChallenge: async (id) => {
    const { incoming, active, history } = get();
    const challenge = incoming.find((c) => c.id === id);
    if (!challenge) return;

    try {
      const snap = await getDoc(doc(db, 'challenge_requests', id));
      const data = snap.exists() ? (snap.data() as ChallengeDoc) : null;

      if (data && isExpired(data)) {
        await updateDoc(doc(db, 'challenge_requests', id), {
          status: 'expired',
          expiredAt: Date.now(),
        });

        const updatedIncoming = incoming.filter((c) => c.id !== id);
        set({ incoming: updatedIncoming });
        saveChallenges({
          incoming: updatedIncoming,
          active,
          history,
          rewardedChallengeIds: get().rewardedChallengeIds,
        });
        return;
      }

      await updateDoc(doc(db, 'challenge_requests', id), {
        status: 'active',
        acceptedAt: Date.now(),
      });
    } catch {}

    const updatedIncoming = incoming.filter((c) => c.id !== id);

    const alreadyActive = active.some((c) => c.id === challenge.id);
    const updatedActive = alreadyActive
      ? active
      : [
          ...active,
          { ...challenge, status: 'active' as ChallengeStatus },
        ];

    set({
      incoming: updatedIncoming,
      active: updatedActive,
    });

    saveChallenges({
      incoming: updatedIncoming,
      active: updatedActive,
      history,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },

  declineChallenge: async (id) => {
    const { incoming, history, active } = get();
    const challenge = incoming.find((c) => c.id === id);
    if (!challenge) return;

    try {
      await updateDoc(doc(db, 'challenge_requests', id), {
        status: 'declined',
        declinedAt: Date.now(),
      });
    } catch {}

    const updatedIncoming = incoming.filter((c) => c.id !== id);
    const updatedHistory = dedupeById([
      ...history,
      { ...challenge, status: 'declined' as ChallengeStatus },
    ]);

    set({
      incoming: updatedIncoming,
      history: updatedHistory,
    });

    saveChallenges({
      incoming: updatedIncoming,
      active,
      history: updatedHistory,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },

  completeChallenge: async (id, myScore, providedOpponentScore) => {
    const { active, history, incoming } = get();
    const challenge = active.find((c) => c.id === id);
    if (!challenge) return;

    const myUid = auth.currentUser?.uid ?? null;
    let opponentScore =
      typeof providedOpponentScore === 'number' ? providedOpponentScore : 0;
    let result: ChallengeResult =
      typeof providedOpponentScore === 'number'
        ? getChallengeResult(myScore, providedOpponentScore)
        : 'waiting';

    if (myUid && challenge.type !== 'daily') {
      try {
        const ref = doc(db, 'challenge_requests', id);
        await updateDoc(ref, {
          [`scores.${myUid}`]: myScore,
          [`completedAtBy.${myUid}`]: Date.now(),
        });

        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as ChallengeDoc) : null;
        const scores = data?.scores ?? {};
        const opponentUid = getOpponentUid(data, myUid);

        if (opponentUid && typeof scores[opponentUid] === 'number') {
          opponentScore = scores[opponentUid];
          result = getChallengeResult(myScore, opponentScore);

          await updateDoc(ref, {
            status: 'completed',
            completedAt: Date.now(),
            winner:
              result === 'draw'
                ? 'draw'
                : result === 'win'
                ? myUid
                : opponentUid,
          });

          if (!get().rewardedChallengeIds.includes(id)) {
            const reward = getRewardForResult(result);
            usePlayerStore.getState().applyReward(
              reward.xp,
              reward.coins,
              reward.gems,
              reward.tickets
            );
            set({ rewardedChallengeIds: [...get().rewardedChallengeIds, id] });
          }
        }
      } catch {}
    }

    if (
      result !== 'waiting' &&
      !get().rewardedChallengeIds.includes(id) &&
      (challenge.type === 'daily' || typeof providedOpponentScore === 'number')
    ) {
      const reward = getRewardForResult(result);
      usePlayerStore.getState().applyReward(
        reward.xp,
        reward.coins,
        reward.gems,
        reward.tickets
      );
      set({ rewardedChallengeIds: [...get().rewardedChallengeIds, id] });
    }

    const updatedActive = active.filter((c) => c.id !== id);
    const updatedHistory = dedupeById([
      {
        ...challenge,
        status: 'completed' as ChallengeStatus,
        myScore,
        opponentScore,
        result,
      },
      ...history,
    ]);

    set({
      active: updatedActive,
      history: updatedHistory,
    });

    saveChallenges({
      incoming,
      active: updatedActive,
      history: updatedHistory,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });

    if (
      challenge.type === 'daily' &&
      !get().hasClaimedTodayReward()
    ) {
      useProfileStore.getState().grantDailyReward();
      get().markTodayRewardClaimed();
    }
  },

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
      status: 'active' as ChallengeStatus,
      createdAt: Date.now(),
      from: systemPlayer,
      to: systemPlayer,
      category: 'daily',
    };

    const updatedActive = dedupeById([...active, dailyChallenge]);

    set({ active: updatedActive });

    saveChallenges({
      incoming,
      active: updatedActive,
      history,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },

  getTodayDailyChallenge: () => {
    const { active, history } = get();
    const todayKey = getTodayKey();

    return (
      active.find((c) => c.type === 'daily' && c.dayKey === todayKey) ||
      history.find((c) => c.type === 'daily' && c.dayKey === todayKey) ||
      null
    );
  },

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

    saveChallenges({
      incoming,
      active,
      history: updatedHistory,
      rewardedChallengeIds: get().rewardedChallengeIds,
    });
  },
}));




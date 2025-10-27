import analytics from '@react-native-firebase/analytics';

export const logPackPlayed = (packId: string) =>
  analytics().logEvent('pack_played', { packId });

export const logPurchaseComplete = (packId: string, price: number) =>
  analytics().logEvent('purchase_complete', { packId, price });

export const logQuestionAnswered = (correct: boolean) =>
  analytics().logEvent('question_answered', { correct });
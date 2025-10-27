export const formatUserProfile = (user: {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || '',
  photoURL: user.photoURL || '',
});
import { formatUserProfile } from '../src/utils/formatUser';

describe('formatUserProfile', () => {
  it('formats Firebase user correctly', () => {
    const mock = {
      uid: 'abc123',
      email: 'test@example.com',
      displayName: 'Yaseen',
      photoURL: 'https://example.com/avatar.png',
    };
    const result = formatUserProfile(mock);
    expect(result).toEqual(mock);
  });
});
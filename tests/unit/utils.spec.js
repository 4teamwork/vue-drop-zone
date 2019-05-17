import { updateLastModified } from '@/utils';

describe('utils', () => {
  test('modifies last modified date', () => {
    const now = new Date(Date.now() - 5).getTime();
    const file = new File([], 'test', { type: 'text', lastModified: now });

    const modifiedFile = updateLastModified(file);
    expect(modifiedFile.lastModified).not.toBe(file.lastModified);
  });
});

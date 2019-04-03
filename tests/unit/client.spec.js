import client from '@/client';
import Vue from 'vue';

function assertFiles(c, expected) {
  const { files } = c.uppy.getState();
  expect(Object.values(files).map(f => f.meta.name))
    .toEqual(expected);
}

describe('client', () => {
  afterEach(() => {
    client.reset();
    delete client.uppy;
  });

  test('throws error when no vm is provided', () => {
    expect(() => { client.init(); })
      .toThrowError(new Error('No vue instance is provided'));
  });

  test('initializes uppy client', () => {
    client.init(new Vue());
    expect(client.uppy).not.toBeUndefined();

    // Installs tus plugin
    expect(Object.keys(client.uppy.plugins))
      .toEqual(['uploader']);
    expect(Object.keys(client.uppy.getPlugin('Tus')))
      .not.toBeUndefined();
  });

  test('accepts options for tus plugin', () => {
    client.init(new Vue());
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: false,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });

    client.init(new Vue(), { resume: true });
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });
  });

  test('adding a file throws when uppy is not initialized', () => {
    expect(() => { client.addFile(); })
      .toThrowError(new Error('Client has not been initialized'));
  });

  test('adds files to the store', () => {
    client.init(new Vue());
    client.addFile({ name: 'file', type: 'image/png', data: '' });
    assertFiles(client, ['file']);
  });

  test('upload throws error when client is not initialized', () => {
    expect(client.upload())
      .rejects
      .toEqual(new Error('Client has not been initialized'));
  });

  test('resets uppy client', () => {
    client.init(new Vue(), { resume: true });
    client.addFile({ name: 'file', type: 'image/png', data: '' });
    assertFiles(client, ['file']);
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });

    client.reset();
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });
    assertFiles(client, []);
  });

  test('supports tus and xhr upload', () => {
    // Default is tus
    client.init(new Vue());
    expect(client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['Tus']);

    client.init(new Vue(), { mode: 'XHR' });
    expect(client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['XHRUpload']);
  });
});

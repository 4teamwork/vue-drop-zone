import Client from '@/client';
import Vue from 'vue';

function assertFiles(c, expected) {
  const { files } = c.uppy.getState();
  expect(Object.values(files).map(f => f.meta.name))
    .toEqual(expected);
}

describe('client', () => {
  test('throws error when no vm is provided', () => {
    // eslint-disable-next-line no-new
    expect(() => { new Client(); })
      .toThrowError(new Error('No vue instance is provided'));
  });

  test('initializes uppy client', () => {
    const client = new Client(new Vue());
    expect(client.uppy).not.toBeUndefined();

    // Installs tus plugin
    expect(Object.keys(client.uppy.plugins))
      .toEqual(['uploader']);
    expect(Object.keys(client.uppy.getPlugin('Tus')))
      .not.toBeUndefined();
  });

  test('accepts uploader options', () => {
    const client = new Client(new Vue());
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: false,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });

    const clientWithOptions = new Client(new Vue(), { uploader: { resume: true } });
    expect(clientWithOptions.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 1,
        retryDelays: [0, 1000, 3000, 5000],
        headers: { Accept: 'application/json' },
      });
  });

  test('accepts uppy options', () => {
    const client = new Client(new Vue());
    expect(client.uppy.opts.meta).toEqual({});

    const clientWithMeta = new Client(new Vue(), { uppy: { meta: { some: 'meta' } } });
    expect(clientWithMeta.uppy.opts.meta).toEqual({ some: 'meta' });
  });

  test('adds files to the store', () => {
    const client = new Client(new Vue());
    client.addFile({ name: 'file', type: 'image/png', data: '' });
    assertFiles(client, ['file']);
  });

  test('resets uppy client', () => {
    const client = new Client(new Vue(), { uploader: { resume: true } });
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
    const client = new Client(new Vue());
    expect(client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['Tus']);

    client.reset({ mode: 'XHR' });
    expect(client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['XHRUpload']);
  });

  test('changes endpoint', () => {
    const client = new Client(new Vue(), { uploader: { endpoint: 'path1' } });
    expect(client.uppy.getPlugin('Tus').opts.endpoint).toBe('path1');

    client.updateEndpoint('path2');
    expect(client.uppy.getPlugin('Tus').opts.endpoint).toBe('path2');
  });
});

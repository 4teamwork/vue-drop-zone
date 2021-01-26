import Vue from 'vue';
import Tus from '@uppy/tus';
import Client from '@/client';

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
    const client = new Client(new Vue(), { uploaderClass: Tus });
    expect(client.uppy).not.toBeUndefined();

    // Installs tus plugin
    expect(Object.keys(client.uppy.plugins))
      .toEqual(['uploader']);
    expect(Object.keys(client.uppy.getPlugin('Tus')))
      .not.toBeUndefined();
  });

  test('accepts uploader options', () => {
    const client = new Client(new Vue(), { uploaderClass: Tus, options: { resume: false } });
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: false,
        autoRetry: true,
        limit: 0,
        useFastRemoteRetry: true,
        retryDelays: [0, 1000, 3000, 5000],
      });

    const clientWithOptions = new Client(
      new Vue(),
      { uploaderClass: Tus, options: { resume: true } },
    );
    expect(clientWithOptions.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        limit: 0,
        useFastRemoteRetry: true,
        retryDelays: [0, 1000, 3000, 5000],
      });
  });

  test('accepts uppy options', () => {
    const client = new Client(new Vue(), { uploaderClass: Tus });
    expect(client.uppy.opts.meta).toEqual({});

    const clientWithMeta = new Client(new Vue(), { uploaderClass: Tus }, { uppy: { meta: { some: 'meta' } } });
    expect(clientWithMeta.uppy.opts.meta).toEqual({ some: 'meta' });
  });

  test('adds files to the store', () => {
    const client = new Client(new Vue(), { uploaderClass: Tus });
    client.addFile({ name: 'file', type: 'image/png', data: '' });
    assertFiles(client, ['file']);
  });

  test('resets uppy client', () => {
    const client = new Client(new Vue(), { uploaderClass: Tus, options: { resume: true } });
    client.addFile({ name: 'file', type: 'image/png', data: '' });
    assertFiles(client, ['file']);
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 0,
        retryDelays: [0, 1000, 3000, 5000],
      });

    client.reset();
    expect(client.uppy.getPlugin('Tus').opts)
      .toEqual({
        resume: true,
        autoRetry: true,
        useFastRemoteRetry: true,
        limit: 0,
        retryDelays: [0, 1000, 3000, 5000],
      });
    assertFiles(client, []);
  });

  test('changes endpoint', () => {
    const client = new Client(new Vue(), { uploaderClass: Tus, options: { endpoint: 'path1' } });
    expect(client.uppy.getPlugin('Tus').opts.endpoint).toBe('path1');

    client.updateEndpoint('path2', 'Tus');
    expect(client.uppy.getPlugin('Tus').opts.endpoint).toBe('path2');
  });
});

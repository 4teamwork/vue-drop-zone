import DropZone from '@/components/DropZone.vue';
import client from '@/client';
import { localMount } from './support';
import { flatMap } from 'lodash';

function assertUppyFiles(w, expected) {
  expect(
    flatMap(
      flatMap(w.emittedByOrder(), e => e.args),
      l => l,
    ).map(u => u.meta.name),
  ).toEqual(expected);
}

describe('DropZone', () => {
  let w;

  beforeEach(async () => {
    w = await localMount(DropZone);
  });

  test('Component renders', () => {
    expect(w.exists()).toBe(true);
  });

  test('activates and deactivates on drag events', () => {
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    // Check that entered is fired once
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    w.trigger('dragleave');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    // Check that left is fired on the last element that is being left
    w.trigger('dragleave');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
    ]);

    // Check reentering the drop-zone
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
    ]);

    // Check the drop event
    w.trigger('drop', { dataTransfer: { files: [] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
      { args: [], name: 'dropped' },
    ]);
  });

  test('emits input events for every store change', async () => {
    assertUppyFiles(w, []);

    w.vm.client.uppy.addFile({ name: 'file1', data: '' });
    expect(w.emittedByOrder().length).toBe(3);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input']);
    assertUppyFiles(w, ['file1']);

    w.vm.client.uppy.addFile({ name: 'file2', data: '' });
    expect(w.emittedByOrder().length).toBe(4);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input', 'input']);
    assertUppyFiles(w, ['file1', 'file1', 'file2']);
  });

  test('control the drop zone with the client', () => {
    client.uppy.addFile({ name: 'file1', data: '' });
    expect(w.emittedByOrder().length).toBe(3);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input']);
    assertUppyFiles(w, ['file1']);

    client.uppy.reset();
    // This event is still here when the file was added
    assertUppyFiles(w, ['file1']);
    expect(client.uppy.getState().files).toEqual({});
  });

  test('run the drop zone in XHR mode', async () => {
    expect(w.emittedByOrder().length).toBe(2);
    w.setProps({ mode: 'XHR' });

    await w.vm.$nextTick();
    expect(client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['XHRUpload']);
  });
});

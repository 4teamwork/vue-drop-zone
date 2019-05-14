import DropZone from '@/components/DropZone.vue';
import { localMount } from './support';
import { flatMap } from 'lodash';
import uuidv4 from 'uuid/v4';

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

    w.vm.client.addFile({ name: 'file1', data: '' });

    // Check the drop event
    w.trigger('drop', { dataTransfer: { files: [] } });

    const inputEvent = [
      {
        data: {
          data: '',
          name: 'file1',
        },
        extension: '',
        id: 'uppy-file1',
        isRemote: false,
        meta: {
          name: 'file1',
          type: 'application/octet-stream',
        },
        name: 'file1',
        preview: undefined,
        progress: {
          bytesTotal: 0,
          bytesUploaded: 0,
          percentage: 0,
          uploadComplete: false,
          uploadStarted: false,
        },
        remote: '',
        size: 0,
        source: '',
        type: 'application/octet-stream',
      },
    ];

    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
      { args: [inputEvent], name: 'input' },
      { args: [], name: 'dropped' },
    ]);

    // Check that entered event is fired after drop
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
      { args: [inputEvent], name: 'input' },
      { args: [], name: 'dropped' },
      { args: [], name: 'entered' },
    ]);
  });

  test('emits input events for every store change', async () => {
    assertUppyFiles(w, []);

    w.vm.client.addFile({ name: 'file1', data: '' });
    expect(w.emittedByOrder().length).toBe(3);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input']);
    assertUppyFiles(w, ['file1']);

    w.vm.client.addFile({ name: 'file2', data: '' });
    expect(w.emittedByOrder().length).toBe(4);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input', 'input']);
    assertUppyFiles(w, ['file1', 'file1', 'file2']);
  });

  test('control the drop zone with the client', () => {
    w.vm.client.addFile({ name: 'file1', data: '' });
    expect(w.emittedByOrder().length).toBe(3);
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'input']);
    assertUppyFiles(w, ['file1']);

    w.vm.client.reset();
    // This event is still here when the file was added
    assertUppyFiles(w, ['file1']);
    expect(w.vm.client.uppy.getState().files).toEqual({});
  });

  test('run the drop zone in XHR mode', async () => {
    expect(w.emittedByOrder().length).toBe(2);
    w.setProps({ mode: 'XHR' });

    await w.vm.$nextTick();
    expect(w.vm.client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['XHRUpload']);
  });

  test('adds unique ids to label and input elements', async () => {
    w = await localMount(DropZone, { propsData: { fileBrowser: true } });
    expect(w.find('label').attributes('for')).toBe('268d77d2-420b-4be9-a814-d5063fe76fb6');
    expect(w.find('input').attributes('id')).toBe('268d77d2-420b-4be9-a814-d5063fe76fb6');
  });
});

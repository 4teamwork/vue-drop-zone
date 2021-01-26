import flatMap from 'lodash/flatMap';
import DropZone from '@/components/DropZone.vue';
import { localMount } from './support';
import Client from '../../src/client';
import XHRUpload from '@uppy/xhr-upload';

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
    // Mock the clients upload function
    Client.prototype.upload = jest.fn();
  });

  test('Component renders', () => {
    expect(w.exists()).toBe(true);
  });

  test('activates and deactivates on drag events', () => {
    w.trigger('dragenter', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    // Check that entered is fired once
    w.trigger('dragenter', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    w.trigger('dragleave', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
    ]);

    // Check that left is fired on the last element that is being left
    w.trigger('dragleave', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
    ]);

    // Check that anything other than files is ignored on dragenter
    w.trigger('dragenter', { dataTransfer: { types: ['text/plain'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
    ]);

    // Check reentering the drop-zone
    w.trigger('dragenter', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder()).toEqual([
      { args: [[]], name: 'input' },
      { args: [[]], name: 'input' },
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
    ]);

    w.vm.client.addFile({ name: 'file1', data: '' });

    // Check the drop event
    w.trigger('drop', { dataTransfer: { files: [], types: ['Files'] } });

    const inputEvent = [
      {
        data: {
          data: '',
          name: 'file1',
        },
        extension: '',
        id: 'uppy-file1-application/octet-stream',
        isRemote: false,
        meta: {
          name: 'file1',
          type: 'application/octet-stream',
        },
        name: 'file1',
        preview: undefined,
        progress: {
          bytesTotal: null,
          bytesUploaded: 0,
          percentage: 0,
          uploadComplete: false,
          uploadStarted: null,
        },
        remote: '',
        size: null,
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
    w.trigger('dragenter', { dataTransfer: { types: ['Files'] } });
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

  test('change the uploader', async () => {
    expect(w.emittedByOrder().length).toBe(2);

    w.setProps({ uploader: { uploaderClass: XHRUpload } });

    await w.vm.$nextTick();
    expect(w.vm.client.uppy.plugins.uploader.map(u => u.title))
      .toEqual(['XHRUpload']);
  });

  test('adds unique ids to label and input elements', async () => {
    w = await localMount(DropZone, { propsData: { fileBrowser: true } });
    expect(w.find('label').attributes('for')).toBe('268d77d2-420b-4be9-a814-d5063fe76fb6');
    expect(w.find('input').attributes('id')).toBe('268d77d2-420b-4be9-a814-d5063fe76fb6');
  });

  test('triggers the upload with the dropped files', async () => {
    w.trigger('drop', { dataTransfer: { files: [new File([''], 'file1', { type: 'text' })], types: ['Files'] } });
    expect(w.vm.client.upload.mock.calls[0][0][0].name).toEqual('file1');
  });

  test('does not upload when preventUpload is set to true', async () => {
    w = await localMount(DropZone, { propsData: { options: { preventUpload: true } } });
    w.trigger('drop', { dataTransfer: { files: [], types: ['Files'] } });

    expect(w.vm.client.upload).not.toHaveBeenCalled();
  });

  test('triggers upload event when files are being uploaded', async () => {
    w = await localMount(DropZone, { propsData: { options: { preventUpload: true } } });
    w.trigger('drop', { dataTransfer: { files: [new File([''], 'file1', { type: 'text' })], types: ['Files'] } });
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input', 'dropped', 'upload']);
    expect(w.emittedByOrder()[3].args[0][0].name).toEqual('file1');
  });

  test('drop zone can be disabled', async () => {
    w = await localMount(DropZone, { propsData: { disabled: true, fileBrowser: true } });
    w.trigger('dragenter', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input']);
    w.trigger('dragleave', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input']);
    w.trigger('drop', { dataTransfer: { types: ['Files'] } });
    expect(w.emittedByOrder().map(e => e.name)).toEqual(['input', 'input']);

    expect(w.find('input').attributes('disabled')).toEqual('disabled');
    expect(w.find('label').classes()).toEqual(['disabled']);
  });

  test('can extend the uppy client with a plugin', async () => {
    const installFunction = jest.fn();
    function ExamplePlugin() {
      return {
        id: 'example-plugin',
        type: 'example',
        install: installFunction,
      };
    }
    w = await localMount(DropZone, { propsData: { plugins: [ExamplePlugin] } });

    expect(installFunction).toHaveBeenCalled();
  });

  test('can extend the uppy client with multiple plugins', async () => {
    const installFunction = jest.fn();
    function ExamplePlugin1() {
      return {
        id: 'example-plugin-1',
        type: 'example',
        install: installFunction,
      };
    }
    function ExamplePlugin2() {
      return {
        id: 'example-plugin-2',
        type: 'example',
        install: installFunction,
      };
    }
    w = await localMount(DropZone, { propsData: { plugins: [ExamplePlugin1, ExamplePlugin2] } });

    expect(installFunction).toHaveBeenCalledTimes(2);
  });

  test('can extend provided plugins with options', async () => {
    const options = { option1: 'option-1' };
    const providedOpts = jest.fn();
    function ExamplePlugin(uppy, opts) {
      providedOpts(opts);
      return {
        id: 'example-plugin',
        type: 'example',
        install: () => {},
      };
    }
    w = await localMount(DropZone, { propsData: { plugins: [[ExamplePlugin, options]] } });

    expect(providedOpts).toHaveBeenCalledWith(options);
  });
});

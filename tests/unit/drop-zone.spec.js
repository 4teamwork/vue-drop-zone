import DropZone from '@/components/DropZone.vue';
import { localMount } from './support';

describe('DropZone', () => {
  let w;

  beforeEach(async () => {
    w = await localMount(DropZone);
  });

  test('Component renders', async () => {
    expect(w.exists()).toBe(true);
  });

  test('activates and deactivates on drag events', async () => {
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
    ]);

    // Check that entered is fired once
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
    ]);

    w.trigger('dragleave');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
    ]);

    // Check that left is fired on the last element that is being left
    w.trigger('dragleave');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
    ]);

    // Check reentering the drop-zone
    w.trigger('dragenter');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
    ]);

    // Check the drop event
    w.trigger('drop');
    expect(w.emittedByOrder()).toEqual([
      { args: [], name: 'entered' },
      { args: [], name: 'left' },
      { args: [], name: 'entered' },
      { args: [], name: 'dropped' },
    ]);
  });
});

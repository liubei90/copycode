import type Watcher from './watcher';
import config from '../config';
import { callHook, activateChildComponent } from '../instance/lifecycle';

import { warn, nextTick, devtools } from '../util/index';

export const MAX_UPDATE_COUNT = 100;

const queue = [];
const activatedChildren = [];
let has = {};
let circular = {};
let waiting = false;
let flushing = false;
let index = 0;

function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  circular = {};
  waiting = flushing = false;
}

function flushSchedulerQueue() {
  flushing = true;
  let watcher, id;

  queue.sort((a, b) => a.id - b.id);

  for(index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
  }

  const activatedQUEUE = activatedChildren.slice();
  const updatedQueue = queue.slice();

  resetSchedulerState();

  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);
}


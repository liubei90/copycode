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

function callUpdatedHooks(queue) {
  let i = queue.length;
  while(i--) {
    const watcher = queue[i]
    const vm = watcher.vm;
    if(vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated');
    }
  }
}

export function queueActivatedComponent(vm) {
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks(queue) {
  for(let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateddChildComponent(queue[i], true);
  }
}

export function queueWatcher(watcher) {
  const id = watcher.id;
  if(has[id] == null) {
    has[id] = true;
    if(!flushing) {
      queue.push(watcher);
    } else {
      let i = queue.length - 1;
      while(i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i+1, 0, watcher);
    }
    if(!watcher) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}
import { queueWatcher } from './scheduler';
import Dep, { pushTarget, popTarget } from './dep';

import { warn, 
  remove, 
  isObject, 
  parsePath, 
  _Set as Set, 
  handleError } from '../util/index';

import type { ISet } from '../util.index';

let uid = 0;

export default class Watcher {
  vm;
  expression;
  id;
  deep;
  user;
  lazy;
  sync;
  dirty;
  active;
  deps;
  newDeps;
  depIds;
  newDepIds;
  getter;
  value;

  constructor (vm, expOrFn, cb, options) {
    this.vm = vm;
    vm._watchers.push(this);
    if(options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid;
    this.active = true;
    this.dirty = this.lazy;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = '';
    if(typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if(!this.getter) {
        this.getter = function() {}
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }
  get() {
    pushTarget(this);
    let value;
    const vm = this.vm;
    try{
      value = this.getter.call(vm, vm);
    } catch(e) {
      if(this.user) {
        handleError(e, vm, 'getter for watcher '+this.expression);
      } else {
        throw e;
      }
    } finally {
      if(this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }

  addDep(dep) {
    const id = dep.id;
    if(!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if(!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  cleanupDeps() {
    let i = this.deps.length;
    while(i--) {
      const dep = this.deps[i];
      if(!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  update() {
    if(this.lazy) {
      this.dirty = true;
    } else if(this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  run() {
    if(this.active) {
      const value = this.get();
      if(
        value !== this.value ||
        isObject(value) ||
        this.deep
      ) {
        const oldValue = this.value;
        this.value = value;
        if(this.user) {
          try{
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            ;
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].depend();
    }
  }

  teardown() {
    if(this.active) {
      if(!this.vm._isBeginDestoryed) {
        remove(this.vm._watchers, this);
      }
      let i = this.deps.length;
      while(i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  }
}

const seenObjects = new Set();
function traverse(val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse(val, seen) {
  let i, keys;
  const isA = Array.isArray(val);
  if((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return;
  }
  if(val.__ob__) {
    const depId = val.__ob__.dep.id;
    if(seen.has(depId)) {
      return;
    }
    seen.add(depId);
  }
  if(isA) {
    i = val.length;
    while(i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while(i--) _traverse(val[keys[i]], seen)
  }
}
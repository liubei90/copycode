// import config from '../config';
// import Watcher from '../';

export let activeInstance = null;
export let isUpdatingChildComponent = false;


export function initLifecycle (vm) {
  const options = vm.$options;
  let parent = options.parent;
  if(parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
  
  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}
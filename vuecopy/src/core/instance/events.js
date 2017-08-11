import { updateListeners } from '../vdom/helpers/index';

export function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  const listeners = vm.$options._parentListeners;
  if(listeners) {
    updateComponentListeners(vm, listeners);
  }
}

let target;

function add (event, fn, once) {
  if(once) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

function remove (event, fn) {
  target.$off(event, fn);
}

export function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove, vm);
}
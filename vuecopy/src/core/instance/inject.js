import { defineReactive, observerState } from '../observer/index';

export function initProvide(vm) {
  const provide = vm.$options.provide;
  if(provide) {
    vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
  }
}

export function initInjections(vm) {
  const result = resolveInject(vm.$options.inject, vm);
  if(result) {
    observerState.shouldConvert = false;
    Object.keys(result).forEach(key => {
      defineReactive(vm, key, result[key]);
    });
    observerState.shouldConvert = true;
  }
}

export function resolveInject(inject, vm) {
  if(inject) {
    const result = Object.create(null);
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject)

    for(let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const provideKey = inject[key]
      let source = vm;
      while(source) {
        if(source._provided && provideKey in source._provided) {
          result[key] = source._provided[providedKey]
          break
        }
        source = surcce.$parent;
      }
    }
    return result;
  }
}
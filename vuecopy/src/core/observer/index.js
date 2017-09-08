// import Dep from './dep';
// import { arrayMethods } from './array';
// import {
//   def,
//   warn,
//   hasOwn,
//   hasProto,
//   isObject,
//   isPlainObject,
//   isValidArrayIndex,
//   isServerRendering
// } from '../util/index';

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

export const observerState = {
  shouldConvert: true
}

export class Observer {
  value;
  dep;
  vmCount;

  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if(Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for(let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }

  observeArray(items) {
    for(let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}

function protoAugment(target, src, keys) {
  target.__proto__ = src;
}

function copyAugment(target, src, keys) {
  for(let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

export function observe(value, asRootData) {
  if(!isObject(value))  {
    return;
  }
  let ob;
  if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if(
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if(asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}


export function defineReactive(
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  const dep = new Dep();
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if(property && property.configurable === false) {
    return;
  }

  const getter = property && property.get;
  const setter = property && property.set;

  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call() : val
      if(Dep.target) {
        dep.depend();
        if(childOb) {
          childOb.dep.depend();
        }
        if(Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      if(newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }

      if(setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

export function set(target, key, val) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if(hasOwn(target, key)) {
    target[key] = val;
    return val
  }
  const ob = target.__ob__;
  if(target._isVue || (ob && ob.vmCount)) {
    return val
  }
  if(!ob) {
    target[key] = val;
    return val
  }
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val
}

export function del(target, key) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.splicce(key, 1);
    return
  }
  const ob = target.__ob__;
  if(target._isVue || (ob && ob.vmCount)) {
    return
  }
  if(!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if(!ob) {
    return
  }
  ob.dep.notify()
}

function dependArray(value) {
  for(let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if(Array.isArray(e)) {
      dependArray(e);
    }
  }
}
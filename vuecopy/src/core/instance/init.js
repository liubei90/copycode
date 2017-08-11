import { initLifecycle } from './lifecycle.js';
import { initEvents } from './events.js';

let uid = 0;

export function initMixin(Vue) {
  Vue.prototype._init = function(options) {
    
    const vm = this;
    vm._uid = uid++;
    vm._isVue = true;
    if(options && options._isComponent) {
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    vm._renderProxy = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm);
    initState(vm);
    initProvide(vm);
    callHook(vm, 'created');
    if(vm.$options.el) {
      vm.$mount(vm.$options.el);
    }

  }

}

function initInternalComponent(vm, options) {
  const opts = vm.$options = Object.create(vm.constructor.options);
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts.parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if(options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

export function resolveConstructorOptions(Ctor) {
  let options = Ctor.options;
  if(Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if(superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions;
      const modifiedOptions = resolveModifiedOptions(Ctor);
      if(modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if(options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options;
}

function resolveModifiedOptions(Ctor) {
  let modified;
  const latest = Ctor.options;
  const extended = Ctor.extendOptions;
  const sealed = Ctor.sealedOptions;
  for(const key in latest) {
    if(latest[key] !== sealed[key]) {
      if(!modified) modified = {};
      modified[key] = dedupe(latest[key], extended[key], sealed[key]);
    }
  }
  return modified;
}

function dedupe(latest, extended, sealed) {
  if(Array.isArray(latest)) {
    const res = [];
    sealed = Array.isArray(sealed) ? sealed : [sealed];
    extended = Array.isArray(extended) ? extended : [extended];
    for(let i = 0; i < latest.length; i++) {
      if(extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i]);
      }
    }
    return res;
  } else {
    return latest;
  }

}
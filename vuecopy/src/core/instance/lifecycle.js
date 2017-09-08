import config from '../config';
import Watcher from '../observer/watcher';
// import { mark, measure } from '../util/perf';
// import { createEmptyVNode } from '../vdom/vnode';
import { observerState } from '../observer/index';
import { updateComponentListeners } from './events';

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

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function(vnode, hydrating) {
    const vm = this;
    if(vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    const prevEl = vm.$el;
    const prevVnode = vm._vnode;
    const prevAvtiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    if(!prevVnode) {
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false,
        vm.$options._parentElm,
        vm.$options._refElm);
      
      vm.$options._parentElm = vm.$options._refElm = null;
    } else {
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;

    if(prevEl) {
      prevEl.__vue__ = null;
    }
    if(vm.$el) {
      vm.$el.__vue__ = vm;
    }

    if(vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
  }

  Vue.prototype.$forceUpdate = function() {
    const vm = this;
    if(vm._watcher) {
      vm._watcher.update();
    }
  }

  Vue.prototype.$destroy = function() {
    const vm = this;
    if(vm._isBeingDestoryed) {
      return;
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestoryed = true;

    const parent = vm.$parent;
    if(parent && !parent._isBeingDestoryed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }

    if(vm._watcher) {
      vm._watcher.teardown();
    }
    let i = vm._watchers.length;
    while(i--) {
      vm._watchers[i].teardown();
    }

    if(vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }

    vm._isDestroyed = true;

    vm.__patch__(vm._vnode, null);

    callHook(vm, 'destroyed');

    vm.$off();

    if(vm.$el) {
      vm.$el.__vue__ = null;
    }
  }
}

export function mountComponent(vm, el, hydrating) {
  vm.$el = el;
  if(!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
      vm.$options.el || el) {
      console.warning('you are using the runtime-only build of Vue where the template compiler is not available.');
    } else {
      console.warning('failed to mount component: template or render function not defined');
    }
  }
  callHook(vm, 'beforeMount');

  let updateComponent;
  updateComponent = () => {
    vm._update(vm._render(), hydrating);
  }

  vm._watcher = new Watcher(vm, updateComponent, noop);
  hydrating = false;

  if(vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm;
}

export function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  const hasChildren = !!(
    renderChildren ||
    vm.$options._renderChildren ||
    parentVnode.data.scopedSlots ||
    vm.$scopedSlots !== emptyObject
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode;

  if(vm._vnode) {
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  vm.$attrs = parentVnode.data && parentVnode.data.attrs;
  vm.$listeners = listeners;

  if(propsData && vm.$options.props) {
    observerState.shouldConvert = false;
    const props = vm._props;
    const propKeys = vm.$options._propsKeys || [];
    for(let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i];
      props[key] = validateProp(key, vm.$options.props, propsData, vm);
    }
    observerState.shouldConvert = true;
    vm.$options.propsData = propsData;
  }

  if(listeners) {
    const oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);
  }

  if(hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }
}

function isInInactiveTree(vm) {
  while(vm && (vm = vm.$parent)){
    if(vm._inactive) return true;
  }
  return false;
}

export function activateChildComponent(vm, direct) {
  if(direct) {
    vm._directInactive = false;
    if(isInInactiveTree(vm)) {
      return ;
    }
  } else if(vm._directInactive) {
    return;
  }
  if(vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for(let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

export function deactivatedChildComponent(vm, direct) {
  if(direct) {
    vm._directInactive = true;
    if(isInInactiveTree(vm)) {
      return;
    }
  }

  if(!vm._inactive) {
    vm._inactive = true;
    for(let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$childrenp[i]);
    }
    callHook(vm, 'deactivated');
  }
}

export function callHook(vm, hook){
  const handlers = vm.$options[hook];
  if(handlers) {
    for(let i = 0, j = handlers.length; i < j; i++) {
      try{
        handlers[i].call(vm);
      } catch(e) {
        handleError(e, vm, hook + ' hook');
      }
    }
  }
  if(vm._hasHookEvent) {
    vm.$emit('hook:'+hook);
  }
}
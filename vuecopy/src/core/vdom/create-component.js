import VNode from './vnode';
import { resolveConstructorOptions } from 'core/instance/init';
import { queueActivatedComponent } from 'core/observer/scheduler';
import { createFunctionalComponent } from './create-functional-component';

import { warn, isDef, isUndef, isTrue, isObject } from '../util/index';

import { 
  resolveAsyncComponent, 
  createAsyncPlaceholder, 
  extractPropsFromVNodeData } from './helpers/index';

import { 
  callHook, 
  activeInstance, 
  updateChildComponent, 
  activateChildComponent, 
  deactivatedChildComponent } from '../instance/lifecycle';

  const componentVNodeHooks = {
    init(vnode, hydrating, parentElm, refElm) {
      if(!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
        const child = vnode.componentInstance = createComponentInstanceForVnode(vnode, 
          activeInstance,
          parentElm,
          refElm);
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      } else if(vnode.data.keepAlive) {
        const mountedNode = vnode;
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      }
    },

    prepatch(oldVnode, vnode) {
      const options = vnode.componentOptions;
      const child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(child, 
        options.propsData, 
        options.listeners, 
        vnode, 
        options.children);
    },

    insert(vnode) {
      const { context, componentInstance } = vnode;
      if(!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if(vnode.data.keepAlive) {
        if(context._isMounted) {
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true);
        }
      }
    },

    destory(vnode) {
      const { componentInstance } = vnode;
      if(!componentInstance._isDestroyed) {
        if(!vnode.data.keepAlive) {
          componentInstance.$destory();
        } else {
          deactivatedChildComponent(componentInstance, true);
        }
      }
    }
  }

  const hooksToMerge = Object.keys(componentVNodeHooks);

  export function createComponent(Ctor, data, context, children, tag) {
    if(isUndef(Ctor)) {
      return;
    }

    const baseCtor = context.$options._base;

    if(isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    if(typeof Ctor !== 'function') {
      if(1) {
        warning('Invalid Component definition')
      }
      return;
    }

    let asyncFactory;
    if(isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
      if(Ctor === undefined) {
        return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
      }
    }

    data = data || {};

    resolceConstructorOptions(Ctor);

    if(isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    const propsData = extractPropsFromVNodeData(data, Ctor, tag);

    if(isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children);
    }

    const listeners = data.on;

    data.on = data.nativeOn;

    if(isTrue(Ctor.options.abstract)) {
      const slot = data.slot;
      data = {};
      if(slot) {
        data.slot = slot;
      }
    }

    mergeHooks(data);

    const name = Ctor.options.name || tag;
    const vnode = new VNode(
      'vue-component-'+Ctor.cid+(name ? '-'+name : ''), 
      data, undefined, undefined, undefined, context, 
      { Ctor, propsData, listeners, tag, children }, asyncFactory);
    return vnode;
  }

  export function createComponentInstanceForVnode(vnode, parent, parentElm, refElm) {
    const vnodeComponentOptions = vnode.componentOptions;
    const options = {
      _isComponent: true,
      parent,
      propsData: vnodeComponentOptions.propsData,
      _componentTag: vnodeComponentOptions.tag,
      _parentVnode: vnode,
      _parentListeners: vnodeComponentOptions.listeners,
      _renderChildren: vnodeComponentOptions.children,
      _parentElm: parentElm || null,
      _refElm: refElm || null,
    }

    const inlineTemplate = vnode.data.inlineTemplate;
    if(isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnodeComponentOptions.Ctor(options);
  }

  function mergeHooks(data) {
    if(!data.hook) {
      data.hook = {}
    }
    for(let i = 0; i < hooksToMerge.length; i++) {
      const key = hooksToMerge[i];
      const fromParent = data.hook[key];
      const ours = componentVNodeHooks[key];
      data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours;
    }
  }

  function mergeHook(one, two) {
    return function(a, b, c, d) {
      one(a, b, c, d);
      two(a, b, c, d);
    }
  }

  function transfromModel(options, data) {
    const prop = (options.model && options.model.prop) || 'value';
    const event = (options.model && options.model.event) || 'input';
    (data.props || (data.props = {}))[prop] = data.model.value;
    const on = data.on || (data.on = {});
    if(isDef(on[event])) {
      on[event] = [data.model.callback].concat(on[event]);
    } else {
      on[event] = data.model.callback;
    }
  }
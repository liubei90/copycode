

export function initRender(vm) {
  vm._vnode = null;
  vm._staticTrees = null;
  const parentVnode = vm.$vnode = vm.$options._parentVnode;
  const renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);
  const parentData = parentVnode && parentVnode.data;
  defineReactive(vm, '$attrs', parentData && parentData.attrs, null, true);
  defineReactive(vm, '$listeners', vm.$options._parentListeners, null, true);
}

export function renderMixin(Vue) {
  Vue.prototype.$nextTick = function(fn) {
    return nextTick(fn, this);
  }

  Vue.prototype._render = function() {
    const vm = this;
    const {
      render,
      staticRenderFns,
      _parentVnode
    } = vm.$options;

    if(vm._isMounted) {
      for(const key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    vm.$scopeSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

    if(staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }

    vm.$vnode = _parentVnode;

    let vnode;
    try{
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch(e) {
      handleError(e, vm, 'render function');

      vnode = vm._vnode;
    }

    if(!(vnode instanceof VNode)) {
      console.warning(' Multiple root nodes returned from render function. ');
      vnode = createEmptyVNode();
    }

    vnode.parent = _parentVnode;
    return vnode;
  }

  Vue.prototype._o = markOnce;
  Vue.prototype._n = toNumber;
  Vue.prototype._s = toString;
  Vue.prototype._l = renderList;
  Vue.prototype._t = renderSlot;
  Vue.prototype._q = looseEqual;
  Vue.prototype._i = looseIndexOf;
  Vue.prototype._m = renderStatic;
  Vue.prototype._f = resolveFilter;
  Vue.prototype._k = checkKeyCodes;
  Vue.prototype._b = bindObjectProps;
  Vue.prototype._v = createTextVNode;
  Vue.prototype._e = createEmptyVNode;
  Vue.prototype._u = resolveScopedSlots;
  Vue.prototype._g = bindObjectListeners;
}
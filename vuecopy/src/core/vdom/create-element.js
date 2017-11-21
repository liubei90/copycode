import config from '../config';
import VNode, { createEmptyVNode } from './vnode';
import { createComponent } from './create-component';

import { warn, isDef, isUndef, isTrue, isPrimitive, resolveAsset } from '../util/index';

import { normalChildren, simpleNormalizeChildren } from './helpers/index';

const SIMPLE_NORMALIZE = 1;
const ALWAYS_NORMALIZE = 2;

export function createElement(
  context, 
  tag, 
  data, 
  children, 
  normalizationType, 
  alwaysNormalize) {
  if(Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if(isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType);
}

export function _createElement(
  context, 
  tag, 
  data, 
  children, 
  normalizationType) {
  if(isDef(data) && isDef(data.__ob__)) {
    return createEmptyVNode();
  }

  if(isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if(!tag) {
    return createEmptyVNode();
  }

  if(1 && isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    ;
  }

  if(Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }

  if(normalizationType === ALWAYS_NORMALIZE) {
    children = normalChildren(children);
  } else if(normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }

  let vnode, ns;
  if(typeof tag === 'string') {
    let Ctor;
    ns = config.getTagNamespace(tag);
    if(config.isReservedTag(tag)) {
      vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
    } else if(isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  }else {
    vnode = createComponent(tag, data, context, children);
  }

  if(isDef(vnode)) {
    if(ns) applyNS(vnode, ns);
  } else {
    return createEmptyVNode();
  }
}

function applyNS(vnode, ns) {
  vnode.ms = ns;
  if(vnode.tag === 'foreignObject') {
    return;
  }

  if(isDef(vnode.children)) {
    for(let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i];
      if(isDef(children.tag) && isUndef(child.ns)) {
        applyNS(child, ns);
      }
    }
  }
}
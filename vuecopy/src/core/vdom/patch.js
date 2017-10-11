import VNode from './vnode';
import config from '../config';
import { SSR_ATTR } from 'shared/constants';
import { registerRef } from './modules/ref';
import { activeInstance } from '../instance/lifecycle';

import {
  warn, isDef, isUndef, isTrue, makeMap, isPrimitive
} from '../util/index';

export const emptyNode = new VNode('', {}, []);

const hooks = ['create', 'activate', 'update', 'remove', 'destory'];

function sameVnode(a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType(a, b) {
  if(a.tag !== 'input') return true;
  let i;
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for(i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if(isDef(key)) map[key] = i;
  }
  return map;
}

export function createPatchFunction(backend) {
  let i, j;
  const cbs = {};

  const { modules, nodeOps } = backend;

  for(i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for(j = 0; j < modules.length; ++j) {
      if(isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    function remove() {
      if(--remove.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove;
  }

  function removeNode(el) {
    const parent = nodeOps.parentNode(el)
    if(isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  let inPre = 0;
  function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested;
    if(createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return;
    }

    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;
    if(isDef(tag)) {
      if(1) {
        if(data && data.pre) {
          inPre++;
        }
        if(!inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)) {
          console.warn('Unknown custom element: '+tag);
        }
      }
      vnode.elm = vnode.ns 
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);

      if(0) { // weex
        ;
      } else {
        createChildren(vnode, children, insertedVnodeQueue);
        if(isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }
      if(1 && data && data.pre) {
        inPre--;
      }
    } else if(isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    let i = vnode.data;
    if(isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if(isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false, parentElm, refElm);
      }

      if(idDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        if(isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true;
      }
    }
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if(isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if(isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      registerRef(vnode);
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    let i;
    let innerNode = vnode;
    while(innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if(isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for(i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode)
        }
        insertedVnodeQueue.push(innerNode);
        break;
      }
    }
    insert(parentElm, vnode.elm, refElm);
  }

  function insert(parent, elm, ref) {
    if(isDef(parent)) {
      if(isDef(ref)) {
        if(ref.parentNode === parent) {
          nodeOps.insertBefore(parent, elm, ref);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if(Array.isArray(children)) {
      for(let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if(isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  function isPatchable(vnode) {
    while(vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag);
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for(let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if(isDef(i)) {
      if(isDef(i.create)) i.create(emptyNode, vnode);
      if(isDef(i.insert)) insertedVnodeQueue.push(vnode);
    }
  }

  function setScope(vnode) {
    ;
  }


}
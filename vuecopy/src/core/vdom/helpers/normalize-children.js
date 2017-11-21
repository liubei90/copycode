import VNode, { createTextVNode } from 'core/vdom/vnode';
import { isFalse, isTrue, isDef, isUndef, isPrimitive } from 'shared/util';

export function simpleNormalizeChildren(children) {
  for(let i = 0; i < children.length; i++) {
    if(Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children);
    }
  }
  return children;
}

export function normalizeChildren(children) {
  return isPrimitive(children) 
  ? [ createTextVNode(children) ] 
  : Array.isArray(children) 
    ? normalizeArrayChildren(children) 
    : undefined
}

function isTextNode(node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

function normalizeArrayChildren(children, nestedIndex) {
  const res = [];
  let i, c, last;
  for(i = 0; i < children.length; i++) {
    c = children[i];
    if(isUndef(c) || typeof c === 'boolean') continue;
    last = res[res.length - 1];

    if(Array.isArray(c)) {
      res.push.apply(res, normalizeArrayChildren(c, (nestedIndex || '')+'_'+i));
    } else if(isPrimitive(c)) {
      if(isTextNode(last)) {
        last.text += String(c)
      } else if(c !== '') {
        res.push(createTextVNode(c));
      }
    } else {
      if(isTextNode(c) && isTextNode(last)) {
        res[res.length - 1] = createTextVNode(last.text + c.text);
      } else {
        if(isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)){
          c.key = '__vlist'+nestedIndex+'_'+i+'__';
        } 
        res.push(c);
      }
    }
  }
  return res;
}
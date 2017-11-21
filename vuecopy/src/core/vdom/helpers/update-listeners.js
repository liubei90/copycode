import { warn } from 'core/util/index';
import { cached, isUndef } from 'shared/util';

const normalizeEvent = cached((name) => {
  const passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  const once = name.charAt(0) === '~';
  name = once ? name.slice(1) : name;
  const capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name,
    once,
    capture,
    passive
  }
});

export function createFnInvoker(fns) {
  function invoker() {
    const fns = invoker.fns;
    if(Array.isArray(fns)) {
      const cloned = fns.slice();
      for(let i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments);
      }
    } else {
      return fns.apply(null, arguments);
    }
  }
  invoker.fns = fns;
  return invoker;
}


export function updateListeners (
  on, oldOn, add, remove, vm
) {
  let name, cur, old, event;
  for(name in on) {
    cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if(isUndef(cur)) {
      console.log('invalid handler for event '+event.name);
    } else if(isUndef(old)) {
      if(isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur);
      }
      add(event.name, cur, event.once, event.capture, event.passive);
    } else if(cur !== old) {
      old.fnx = cur;
      on[name] = old;
    }
  }
  for(name in oldOn) {
    if(isUndef(on[name])) {
      event = normalizeEvent(name);
      remove(event.name, oldOn[name], event.capture);
    }
  }
}
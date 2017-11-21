import { createFnInvoker } from './update-listeners';;
import { remove, isDef, isUndef, isTrue } from 'shared/util';

export function mergeVNodeHook(def, hookKey, hook) {
  let invoker;
  const oldHook = def[hookKey];

  function wrappedHook() {
    hook.apply(this, arguments);
    remove(invoker.fns, wrappedHook)
  }

  if(isUndef(oldHook)) {
    invoker = createFnInvoker([wrappedHook]);
  } else {
    if(isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}
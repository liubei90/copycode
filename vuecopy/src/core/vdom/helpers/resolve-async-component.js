import { warn, once, isDef, isUndef, isTrue, isObject } from 'core/util/index';

import { createEmptyVNode } from 'core/vdom/vnode';

function ensureCtor(comp, base) {
  if(comp.__esModule && comp.default) {
    comp = comp.default;
  }
  return isObject(comp) ? base.extend(comp) : comp;
}

export function createAsyncPlaceholder(factory, data, context, children, tag) {
  const node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data, context, children, tag };
  return node;
}

export function resolveAsyncComponent(factory, baseCtor, context) {
  if(isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp;
  }

  if(isDef(factory.resolved)) {
    return factory.resolved;
  }

  if(isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp;
  }

  if(isDef(factory.contexts)) {
    factory.contexts.push(context);
  } else {
    const contexts = factory.contexts = [context];
    let sync = true;

    const forceRender = () => {
      for(let i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate();
      }
    }

    const resolve = once((res) => {
      factory.resolved = ensureCtor(res, baseCtor);

      if(!sync) {
        forceRender();
      }
    });

    const reject = once(reason => {
      if(isDef(factory.errorComp)) {
        factory.error = true;
        forceRender();
      }
    });

    const res = factory(resolve, reject);

    if(isObject(res)) {
      if(typeof res.then === 'function') {
        if(isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if(isDef(res.component) && typeof res.component.then === 'function') {
        res.component.then(resolve, reject);

        if(isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if(isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if(res.delay === 0) {
            factory.loading = true;
          } else {
            setTimeout(() => {
              if(isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender();
              }
            }, res.delay || 200);
          }
        }

        if(isDef(res.timeout)) {
          setTimeout(() => {
            if(isUndef(factory.resolved)) {
              reject('timeout '+res.timeout+'ms');
            }
          }, res.timeout);
        }
      }
    }

    sync = false;

    return factory.loading ? factory.loadingComp : factory.resolved;

  }
}
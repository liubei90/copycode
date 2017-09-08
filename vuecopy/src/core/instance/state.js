// import 


const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState(vm) {
  vm._watchers = [];
  const opts = vm.$options;
  if(opts.props) initProps(vm, opts.props);
  if(opts.methods) initMethods(vm, opts.methods);
  if(opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true);
  }
  if(opts.computed) initComputed(vm, opts.computed);
  if(opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function checkOptionType(vm, name) {
  const option = vm.$options[name];
  if(!isPlainObject(option)) {
    console.warn('component option '+ name + ' should be an object');
  }
}

function initProps(vm, propsOptions) {
  const propsData = vm.$options.propsData || {};
  const props = vm._props = {};

  const keys = vm.$options._propsKeys = [];
  const isRoot = !vm.$parent;

  observerState.shouldConvert = isRoot;
  for(const key in propsOptions) {
    keys.push(key);
    const value = validateProp(key, propsOptions, propsData, vm);
    defineReactive(props, key, value);
    if(!(key in vm)) {
      proxy(vm, '_props', key);
    }
  }
  observerState.shouldConvert = true;
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if(!isPlainObject(data)) {
    data = {};
  }
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  while(i--) {
    const key = keys[i];
    if(methods && hasOwn(methods, key)) {
      console.warning('method '+ key + 'has already been defined as a data property');
    }
    if(props && hasOwn(props, key)) {
      console.warning('the data property '+ key + 'is already declared as a prop');
    } else if(!isReserved(key)) {
      proxy(vm, '_data', key)
    }
  }
  observe(data, true);
}

function getData(data, vm) {
  try {
    return data.call(vm);
  } catch(e) {
    handleError(e, vm, 'data()');
    return {};
  }
}

const computedWatcherOptions = { lazy: true };

function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null);

  for(const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if(!getter) {
      console.log('getter is mission for computed prpoerty '+key);
    }
    watchers[key] = new watchers(vm, getter || noop, noop, computedWatcherOptions);

    if(!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else {
      if(key in vm.$data) {
        console.warning('the computed property '+key+' is already defined in data');
      } else if(vm.$options && key in vm.$options.props) {
        console.warning('the computed property '+key+' is already defined as a prop');
      }
    }
  }
}

export function defineComputed(target, key, userDef) {
  if(typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get 
      ? userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set 
      ? userDef.set
      : noop
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if(watcher) {
      if(watcher.dirty) {
        watcher.evaluate();
      }
      if(Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  }
}

function initMethods(vm, methods) {
  const props = vm.$options.props;
  for(const key in methods) {
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
    if(methods[key] == null) {
      console.warning('method '+ key +' has an undefined value');
    }
    if(props && hasOwn(props, key)) {
      console.warning('method '+key+' has already been defined as a prop');
    }
  }
}

function initWatch(vm, watch) {
  for(const key in watch) {
    const handler = watch[key];
    if(Array.isArray(handler)) {
      for(let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, keyOrFn, handler, options) {
  if(isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if(typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(keyOrFn, handler, options);
}

export function stateMixin(Vue) {
  const dataDef = {};
  dataDef.get = function () { return this._data };
  const propsDef = {};
  propsDef.get = function() { return this._props };
  dataDef.set = function() {
    console.warning(' avoid replacing instance root $data. ');
  }
  propsDef.set = function() {
    console.log('props is readonly');
  }

  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.proptotype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function(expOrFn, cb, options) {
    const vm = this;
    if(isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }
    options = options || {};
    options.user = true;
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if(options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    }
  }
}
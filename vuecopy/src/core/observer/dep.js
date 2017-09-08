import type Watcher from './watcher'

let uid = 0;

export default class Dep {
  static target;
  id;
  subs;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    remove(this.subs, sub);
  }

  depend() {
    if(Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for(let i = 0, l = subs.length; i < l; i++) {
      sub[i].update();
    }
  }
}


Dep.target = null;
const targetStack = [];

export function pushTarget(_target) {
  if(Dep.target) targetStack.push(Dep.target);
  Dep.target = _target;
}

export function popTarget() {
  Dep.target = targetStack.pop();
}
import { mergeOptions } from '../util/index';

export function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mregeOptions(this.options, mixin);
    return this;
  }
}
import { ASSET_TYPES } from 'shared/constants';
import { warn, extend, mergeOptions } from '../util/index';
import { defineComputed, proxy } from '../instance/state';

export function initExtend(Vue) {
  Vue.cid = 0;
  let cid = 1;

  Vue.extend = function(extendOptions) {
    extendOptions
  }
}
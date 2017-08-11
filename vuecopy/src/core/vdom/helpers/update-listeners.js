

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
        // cur = 
      }
    }
  }
}
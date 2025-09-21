export function debounce(fn, waitMs = 300) {
  let timerId = null
  return function debounced(...args) {
    if (timerId) clearTimeout(timerId)
    timerId = setTimeout(() => {
      timerId = null
      fn.apply(this, args)
    }, waitMs)
  }
}


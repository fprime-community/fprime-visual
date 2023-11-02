function deBounce(fn, time) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    // timeout = setTimeout(fn.bind(null, ...args), time)
    timeout = setTimeout(() => fn(...args), time)
  }
}

// The motion feature bundle behind LazyMotion. It lives in its own module so it becomes its own
// chunk, loaded after first paint; nothing in the initial graph imports this file statically.
export { domMax as default } from 'motion/react'

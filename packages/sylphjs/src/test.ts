import { log, state } from './index.js';

let logs = 0;

setInterval(() => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const obj = {
    tags: ['test'],
    time: timestamp,
    sin: Math.sin(timestamp),
    tan: Math.tan(timestamp),
    rand: Math.floor(Math.random() * 100),
  };
  console.log(obj);
  log(obj);
  logs++;
}, 1000);

setInterval(() => {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const obj = {
    id: 'test-state',
    tags: ['test'],
    time: timestamp,
    sin: Math.sin(timestamp),
    tan: Math.tan(timestamp),
    rand: Math.floor(Math.random() * 100),
    logs,
  };
  console.log(obj);
  state(obj);
}, 1000);

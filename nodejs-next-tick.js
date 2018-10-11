/**
 * The script here demonstrates how the process.nextTick call works. This call is not part of the
 * event loop. Instead, the callbacks passed to this are put in the next tick queue and executed regardless
 * of the current phase of the event loop.
 *   You may have noticed that process.nextTick() was not displayed in the diagram, even though
 *   it's a part of the asynchronous API. This is because process.nextTick() is not technically part of the event loop.
 *   Instead, the nextTickQueue will be processed after the current operation completes, regardless of the current phase of the event loop.
 *   Looking back at our diagram, any time you call process.nextTick() in a given phase, all callbacks passed to
 *   process.nextTick() will be resolved before the event loop continues. This can create some bad situations because it
 *   allows you to "starve" your I/O by making recursive process.nextTick() calls, which prevents the event loop from
 *   reaching the poll phase.
 *
 *  Also When Node.js starts, it initializes the event loop, processes the provided input script
 *  (or drops into the REPL, which is not covered in this document) which may make async API calls, schedule timers, or
 *  call process.nextTick(), then begins processing the event loop.
 *
 *  The two scenarios show how the process nexttick works when its the first thing called and when the event loop has started
 *  how it works.
 *
 *  Scenario 1: There is a timer with 0 threshold, setImmediate and nextTicks all set. Because the async function's
 *  callback is in process.nextTick it gives an opportunity for the synchronous statements (var initialization) to run
 *  before the callback is called
 *    What happens:
 *      - When this code starts, the asyncOperation is called in which the processTick is called which
 *        puts the callback in the next tick queue.
 *      - Now since the proessTick processes all cbs passed to it, it will execute and log the message.
 *        The variable is logged with the right value because when it initializes it does that.
 *      - Then setImmediate is called since thats set
 *      - Then setTimeout is called with its message.
 *    Output:
 *      Next tick cb 2
 *      immediate
 *      2ms have passed since I was scheduled
 *
 *  Scenario 2: Now in addition to the above scenario, there are 3 process.nextTick calls inside setImmediate. this is to show
 *  how it works on a different phase of the event loop.
 *    What happens:
 *      - When this code starts, the asyncOperation is called in which the processTick is called which
 *        puts the callback in the next tick queue.
 *      - Now since the proessTick processes all cbs passed to it, it will execute and log the message.
 *        The variable is logged with the right value because when it initializes it does that.
 *      - Then setImmediate is called since thats set. but now it has next tick calls in it which put messages into
 *        the next tick queue so they get executed before moving to the next step.
 *      - Then setTimeout is called with its message.
 *
 *    Output:
 *      Next tick cb 2
 *      immediate
 *      ticking away...
 *      ticking away...
 *      ticking away...
 *      2ms have passed since I was scheduled
 *
 *   Scenario 3: I just introduced an actual async operation in the next tick callback to see how it would be executed.
 *
 *  To run: Comment the scenarios out and run one at a time
 */

// Scenario 1
// let foo;

// function someAsyncOperation(callback) {
//   process.nextTick(callback);
// }

// const timeoutScheduled = Date.now();

// setTimeout(() => {
//   const delay = Date.now() - timeoutScheduled;

//   console.log(`${delay}ms have passed since I was scheduled`);
// }, 0);

// setImmediate(() => {
//   console.log('immediate');
// });

// someAsyncOperation(() => {
//   console.log('Next tick cb', foo);
// });

// foo = 2;


// Scenario 2
// import _ from 'underscore';

// let foo;

// function someAsyncOperation(callback) {
//   process.nextTick(callback);
// }

// const timeoutScheduled = Date.now();

// setTimeout(() => {
//   const delay = Date.now() - timeoutScheduled;

//   console.log(`${delay}ms have passed since I was scheduled`);
// }, 0);

// setImmediate(() => {
//   console.log('immediate');
//   _.times(3, () => {
//     process.nextTick(() => {
//       console.log('ticking away...');
//     });
//   });
// });

// someAsyncOperation(() => {
//   console.log('Next tick cb', foo);
// });

// foo = 2;


// Scenario 3
import fs from 'fs';
let foo;

function someAsyncOperation(callback) {
  process.nextTick(callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 0);

setImmediate(() => {
  console.log('immediate');
});

someAsyncOperation(() => {
  console.log('Next tick cb', foo);
  fs.readFile('./half.txt', () => {
    console.log('Finished reading');
  });
});

foo = 2;

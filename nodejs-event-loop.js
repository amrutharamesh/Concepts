/**
 * This script here demonstrates the nodejs event loop as to how the poll, timers and check phases execute under different
 * circumstances. In general, poll phase is the one that can block waiting for I/O events and has two main tasks:
 *   The poll phase has two main functions:
 *   1. Calculating how long it should block and poll for I/O, then
 *   2. Processing events in the poll queue.
 *
 *   When the event loop enters the poll phase and there are no timers scheduled, one of two things will happen:
 *   - If the poll queue is not empty, the event loop will iterate through its queue of callbacks executing them
 *   synchronously until either the queue has been exhausted, or the system-dependent hard limit is reached.
 *
 *   - If the poll queue is empty, one of two more things will happen:
 *     1. If scripts have been scheduled by setImmediate(), the event loop will end the poll phase and continue to the
 *        check phase to execute those scheduled scripts.
 *     2. If scripts have not been scheduled by setImmediate(), the event loop will wait for callbacks to be added to
 *        the queue, then execute them immediately.
 *
 *   Once the poll queue is empty the event loop will check for timers whose time thresholds have been reached.
 *   If one or more timers are ready, the event loop will wrap back to the timers phase to execute those timers' callbacks.
 *
 *  So in this script the first scenario:
 *    Scenario 1. The timer threshold is set to a 0. The setImmediate is also set. And the async function is executed.
 *      What happens:
 *        - When the event loop enters the poll phase, its queue is empty since the readFile is still executing.
 *        - But it sees there is a setImmediate scheduled so it executes that phase (check).
 *        - Next since the timer is set to 0, once the check phase completes the timer's callback is executed. (timers)
 *        - Then when it enters the poll phase, it sees that the queue has an event for the readFile callback. now that is
 *          called (poll)
 *      Output:
 *        immediate
 *        2ms have passed since I was scheduled
 *        First here
 *
 *    Scenario 2: The timer threshold is set to 30. The setImmediate is also set. And the async function is executed.
 *      What happens:
 *        - When the event loop enters the poll phase, its queue is empty since the readFile is still executing.
 *        - But it sees there is a setImmediate scheduled so it executes that phase (check).
 *        - The timer's threshold has not reached so it goes to the poll phase.
 *        - In the poll phase, it sees that the queue has an event for the readFile callback. now that is
 *          called (poll).
 *        - The poll queue is now empty and the timer has reached its threshold so it executes that next (timers)
 *       Output:
 *         immediate
 *         First here
 *         31ms have passed since I was scheduled
 *
 *  So the poll phase can wait and poll for events unless one of three things happen:
 *     1. setImmediate is set --- always called first
 *     2. setTimeout threshold is reached - 2 or 3 whichever comes first
 *     3. system hard limit is reached (so it doesnt stay there waiting forever)
 *
 */

import fs from 'fs';

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('./half.txt', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 30);


setImmediate(() => {
  console.log('immediate');
});

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  console.log('First here');
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});

/*
    Simple timer queue. First call creates/returns a closure object that contains the
    queue plus associated code, and the public method to play it. Uses setTimeout, but
    in batches so it won't create too many timers at once. Delay time for each queue
    item is successive (i.e., non-cumulative) and is specified as a multiple of a base
    time step. This makes it easy to change the delay for any individual item without
    having to change any others to maintain proper sequence, and to adjust the entire
    queue duration at once by simply changing the base time step.

    Expects two arguments:
    step: base timeslice in milliseconds
    que: array of queue entries, each entry being a 2-element array
        [0] - number of *steps* to wait before starting this entry (NON-CUMULATIVE!)
        [1] - callback function for this entry, as would be used by setTimeout
        
    Example usage:

    const sequence = timeline(150, [
        [ 0, () => console.log("This item runs immediately.") ],
        [ 2, () => console.log("If the batch size is 4, this") ],
        [ 1, () => console.log("queue will run in 2 batches.") ],
        [ 3, () => console.log("----------------------------") ],
        [ 1, () => console.log("Total delay time is:") ],
        [ 2, () => console.log("150 * (0+2+1+3+1+2) = 1350 ms") ],
    ]);

    sequence.play();
*/

function timeline (step, que) {
    "use strict";

    const dt = step || Math.max(1, Number(step));
    const inner = Math.max(1, Math.floor(Math.sqrt(que.length)));
    const outer = Math.floor(que.length / inner);

    function some (batch) {
        let t = 0;
        batch.forEach(function (q) {
            t += dt * q[0];
            setTimeout(q[1], t);
        });
    }

    const play = function () {
        let wait = 0, scheduled = false;
 
        if (que.length > 0) {
            for (let o = 0; o < outer; o += 1) {
                const batch = que.slice(o * inner, (o + 1) * inner);
                setTimeout(some, wait, batch);
                wait += dt * batch.reduce(function (sum, val) {return sum + val[0];}, 0);
            }
            if (outer * inner < que.length) {
                setTimeout(some, wait, que.slice(outer * inner));
            }
            scheduled = true;
        }
        return scheduled;
    };
    return Object.freeze({play: play});
}

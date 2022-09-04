"use strict";

export function sleep(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
}

export function getRndInteger(min, max, step=1) {
    let numStepBlocks = Math.ceil((max - min) / step);
    let numSteps = Math.floor(Math.random() * numStepBlocks);
    return min + numSteps * step;
}
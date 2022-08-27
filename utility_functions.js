export function sleep(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
}

export function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
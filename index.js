"use strict";
const mazegrid = document.getElementById('mazegrid');
const generate_btn = document.getElementById('generate btn');
const nrowsinput = document.getElementById('n rows');
const ncolsinput = document.getElementById('n cols');
const animspeedinput = document.getElementById('anim speed');

// declarations
let maze_arr = null;
let init_anim_speed = 100;

function init_maze_arr(nrows, ncols) {
    maze_arr = new Array(nrows);
    for (let i = 0; i < maze_arr.length; i++) {
        maze_arr[i] = new Array(ncols);
    }
}

function create_cell(row, col) {
    const cell = document.createElement('div');
    cell.classList.add('mazecell', 'passage');
    mazegrid.appendChild(cell);
    maze_arr[row, col] = cell;
}

function sleep(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
}

async function generate_maze(nrows, ncols, anim_speed_multiplier) {
    init_maze_arr(nrows, ncols);
    mazegrid.innerHTML = '';

    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            create_cell(r, c);
            await sleep(init_anim_speed * 100 / anim_speed_multiplier);
        }
    }
}

// script
mazegrid.innerHTML = '';

generate_btn.addEventListener('click', () => {
    let nrows = nrowsinput.value;
    let ncols = ncolsinput.value;
    let anim_speed_multiplier = animspeedinput.value;
    generate_maze(nrows, ncols, anim_speed_multiplier);
});
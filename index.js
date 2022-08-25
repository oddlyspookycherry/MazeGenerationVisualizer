"use strict";
const mazegrid = document.getElementById('mazegrid');
const generate_btn = document.getElementById('generate btn');
const nrowsinput = document.getElementById('n rows');
const ncolsinput = document.getElementById('n cols');

function sleep(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
}

// declarations
let maze_arr = null;
let anim_delay = 50;
let in_generation = false;

function init_maze(nrows, ncols) {
    mazegrid.innerHTML = '';
    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    maze_arr = new Array(nrows);
    for (let i = 0; i < maze_arr.length; i++) {
        maze_arr[i] = new Array(ncols);
    }
}

function create_cell(row, col) {
    const cell = document.createElement('div');
    cell.classList.add('mazecell', 'passage');
    cell.style.gridArea = `${row + 1} / ${col + 1} / span 1 / span 1`;
    mazegrid.appendChild(cell);
    maze_arr[row, col] = cell;
}

async function generate_maze(nrows, ncols) {
    in_generation = true;
    init_maze(nrows, ncols);
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            create_cell(r, c);
            await sleep(anim_delay);
        }
    }
    in_generation = false;
}

// main script
init_maze(10, 10);

generate_btn.addEventListener('click', () => {
    let nrows = nrowsinput.value;
    let ncols = ncolsinput.value;
    if (!in_generation) { generate_maze(nrows, ncols); }
});
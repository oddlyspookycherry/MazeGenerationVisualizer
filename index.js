"use strict";
const mazegrid = document.getElementById('mazegrid');
const generate_btn = document.getElementById('generate btn');
const nrowstext = document.getElementById('n rows');
const ncolstext = document.getElementById('n cols');

// declarations
let maze_arr = null;

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

async function generate_maze(nrows, ncols) {
    init_maze_arr(nrows, ncols);
    mazegrid.innerHTML = '';

    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
            create_cell(r, c);
            await sleep(70);
        }
    }
}

// script
mazegrid.innerHTML = '';

generate_btn.addEventListener('click', () => {
    let nrows = nrowstext.value;
    let ncols = ncolstext.value;
    generate_maze(nrows, ncols);
});
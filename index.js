"use strict";

const mazegrid = document.getElementById('mazegrid');
const generate_btn = document.getElementById('generate btn');
const nrowsinput = document.getElementById('n rows');
const ncolsinput = document.getElementById('n cols');
const methodinput = document.getElementById('method select');

function sleep(duration_ms) {
    return new Promise(resolve => setTimeout(resolve, duration_ms));
}

// declarations
let maze_arr = null;
let anim_delay = 50;
let in_generation = false;

const CellType = {
    passage: "passage",
    wall: "wall"
};

function init_maze(nrows, ncols) {
    mazegrid.innerHTML = '';
    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    maze_arr = new Array(nrows);
    for (let i = 0; i < maze_arr.length; i++) {
        maze_arr[i] = new Array(ncols);
    }
}

function fill_cell(row, col, type) {
    maze_arr[row][col] = type;

    const cell = document.createElement('div');
    cell.classList.add('mazecell', type);
    cell.style.gridArea = `${row + 1} / ${col + 1} / span 1 / span 1`;
    mazegrid.appendChild(cell);
}

async function generate_maze(nrows, ncols, generation_method) {
    init_maze(nrows, ncols);
    generation_method(nrows, ncols);
}

// TO-DO: read algorithms and see if better start with all passages/walls
const gen_methods = {
    "all_passages": async function (nrows, ncols) {
        in_generation = true;
        for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
                fill_cell(r, c, CellType.passage);
                await sleep(anim_delay);
            }
        }
        in_generation = false;
    },
    "all_walls": async function (nrows, ncols) {
        in_generation = true;
        for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
                fill_cell(r, c, CellType.wall);
                await sleep(anim_delay);
            }
        }
        in_generation = false;
    },
    "randomized_depth_first_search": async function (nrows, ncols) {
        in_generation = true;
        in_generation = false;
    }
};

// main script
init_maze(10, 10);

// TO-DO: change button color while animation playing
generate_btn.addEventListener('click', () => {
    let nrows = parseInt(nrowsinput.value);
    let ncols = parseInt(ncolsinput.value);
    let method_name = methodinput.value;
    if (!in_generation) { generate_maze(nrows, ncols, gen_methods[method_name]); }
});
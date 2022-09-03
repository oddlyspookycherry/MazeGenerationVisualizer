"use strict";
import { sleep, getRndInteger } from './utility_functions.js';

const mazegrid = document.getElementById('mazegrid');
const generateBtn = document.getElementById('generateBtn');
const ndiminput = document.getElementById('nDim');
const methodinput = document.getElementById('methodSelect');

// declarations
let mazeArr = null;
let animDelay = 5;
let inGeneration = false;

const CellType = {
    passage: "passage",
    wall: "wall",
    blank: "blank"
};

const Type2Col = {
    "passage": "white",
    "wall": "black",
    "blank": "gray"
}

function initMaze(ndim) {
    mazegrid.innerHTML = '';
    mazegrid.style.gridTemplate = `repeat(${ndim}, 1fr) / repeat(${ndim}, 1fr)`;
    mazeArr = new Array(ndim);
    for (let i = 0; i < mazeArr.length; i++) {
        mazeArr[i] = new Array(ndim);
    }

    // filling maze with blanks
    for (let r = 0; r < ndim; r++) {
        for (let c = 0; c < ndim; c++) {
            const cell = document.createElement('div');
            mazegrid.appendChild(cell);
            mazeArr[r][c] = cell;
            changeCell(r, c, CellType.blank);
        }
    }
}

function changeCell(row, col, type) {    
    let cell = mazeArr[row][col]
    cell.classList = '';
    cell.classList.add('mazecell', type);
    cell.style.backgroundColor = Type2Col[type];
}

async function generateMaze(ndim, generation_method) {
    initMaze(ndim);
    generation_method(ndim);
}

const GenMethods = {
    "all_passages": function (ndim) {
        for (let r = 0; r < ndim; r++) {
            for (let c = 0; c < ndim; c++) {
                changeCell(r, c, CellType.passage);
            }
        }
    },
    "all_walls": function (ndim) {
        for (let r = 0; r < ndim; r++) {
            for (let c = 0; c < ndim; c++) {
                changeCell(r, c, CellType.wall);
            }
        }
    },
    "_base_depth_first_search": async function (ndim, backtrack_index_function) {
        inGeneration = true;
        // Fill everything with walls
        GenMethods.all_walls(ndim);

        // Initialize stack
        let activeCells = [];

        // Choose a random starting point
        let startRow = getRndInteger(0, ndim);
        let startCol = getRndInteger(0, ndim);
        changeCell(startRow, startCol, CellType.passage);
        await sleep(animDelay);
        activeCells.push([startRow, startCol]);

        let directions = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
        ];

        // Create a depth-first traversal
        while (activeCells.length > 0) {
            let curInd = backtrack_index_function(activeCells.length);
            let curCoordnates = activeCells[curInd];

            let randDirInd = getRndInteger(0, directions.length);
            let validDir = false;
            // Check if new coordinates are valid
            for (let i = 0; i <= directions.length; i++) {
                let randDir = directions[(randDirInd + i) % directions.length];
                let [rowStep, colStep] = randDir;
                let midRowCoord = curCoordnates[0] + rowStep;
                let midColCoord = curCoordnates[1] + colStep;
                let newRowCoord = curCoordnates[0] + 2 * rowStep;
                let newColCoord = curCoordnates[1] + 2 * colStep;
                if (newRowCoord >= 0 && newRowCoord < ndim && newColCoord >= 0 && newColCoord < ndim
                    && mazeArr[newRowCoord][newColCoord].classList.contains("wall")) {
                        changeCell(midRowCoord, midColCoord, CellType.passage);
                        await sleep(animDelay);
                        changeCell(newRowCoord, newColCoord, CellType.passage);
                        await sleep(animDelay);
                        activeCells.push([newRowCoord, newColCoord]);
                        validDir = true;
                        break;
                    }
            }
            if (!validDir)
                activeCells.splice(curInd, 1);
        }
        inGeneration = false;
    },
    "last_depth_first_search": function (ndim) {
        GenMethods._base_depth_first_search(ndim, (length) => length - 1);
    },
    "first_depth_first_search": function (ndim) {
        GenMethods._base_depth_first_search(ndim, (length) => 0);
    },
    "random_depth_first_search": function (ndim) {
        GenMethods._base_depth_first_search(ndim, (length) => getRndInteger(0, length));
    },
    "mixed_depth_first_search": function (ndim) {
        GenMethods._base_depth_first_search(ndim, (length) =>
            Math.random() > 0.35 ? length - 1 : getRndInteger(0, length));
    },
    "binary_tree": async function (ndim) {
        inGeneration = true;

        GenMethods.all_walls(ndim);
        changeCell(ndim - 1, ndim - 1, CellType.passage);
        await sleep(animDelay);
        for (let r = ndim - 1; r >= 0; r -= 2) {
            for (let c = ndim - 1; c >= 0; c -= 2) {
                changeCell(r, c, CellType.passage);
                await sleep(animDelay);
            }
        }
        for (let r = ndim - 1; r >= 0; r -= 2) {
            for (let c = ndim - 1; c >= 0; c -= 2) {
                if (r - 1 < 0 && c - 1 < 0) {
                    continue;
                }
                if (r - 1 < 0) {
                    changeCell(r, c - 1, CellType.passage);
                    await sleep(animDelay);
                } else if (c - 1 < 0) {
                    changeCell(r - 1, c, CellType.passage);
                    await sleep(animDelay);
                } else {
                    if (Math.random() > 0.5) {
                        changeCell(r, c - 1, CellType.passage);
                        await sleep(animDelay);
                    } else {
                        changeCell(r - 1, c, CellType.passage);
                        await sleep(animDelay);
                    }
                }
            } 
        }

        inGeneration = false;
    }
};

// main script
initMaze(10);
// TO-DO: change button color while animation playing
generateBtn.addEventListener('click', () => {
    let ndim = parseInt(ndiminput.value);
    let method_name = methodinput.value;
    if (!inGeneration)
        generateMaze(ndim, GenMethods[method_name]);
});
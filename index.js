"use strict";
import { sleep, getRndInteger } from './utility_functions.js';

const mazeGrid = document.getElementById('mazeGrid');
const generateBtn = document.getElementById('generateBtn');
const sizeInput = document.getElementById('mazeSize');
const methodInput = document.getElementById('methodSelect');
const numExitsInput = document.getElementById('numExits');
const wallColorInput = document.getElementById('wallColor');
const animSpeedInput = document.getElementById('animSpeed');

// declarations
let mazeArr = null;
let baseAnimDelay = 20;
let animDelay = baseAnimDelay;
let inGeneration = false;

const MAX_MAZE_SIZE = 70;

const CellType = {
    passage: "passage",
    wall: "wall",
};

let Type2Col = {
    "passage": "white",
    "wall": wallColorInput.value
}

wallColorInput.onchange = () => {
    Type2Col["wall"] = wallColorInput.value;
};

animSpeedInput.onchange = () => {
    animDelay = baseAnimDelay * (1 / animSpeedInput.value);
}

function initMaze(ndim) {
    mazeGrid.innerHTML = '';
    mazeGrid.style.gridTemplate = `repeat(${ndim}, 1fr) / repeat(${ndim}, 1fr)`;
    mazeArr = new Array(ndim);
    for (let i = 0; i < mazeArr.length; i++) {
        mazeArr[i] = new Array(ndim);
    }

    // filling maze with blanks
    for (let r = 0; r < ndim; r++) {
        for (let c = 0; c < ndim; c++) {
            const cell = document.createElement('div');
            mazeGrid.appendChild(cell);
            mazeArr[r][c] = cell;
            if (r != 0 && c != 0 && r != ndim - 1 && c != ndim - 1)
                changeCell(r, c, CellType.passage);
            else
                changeCell(r, c, CellType.wall);
        }
    }
}

function changeCell(row, col, type) {    
    let cell = mazeArr[row][col]
    cell.classList = '';
    cell.classList.add('mazecell', type);
    cell.style.backgroundColor = Type2Col[type];
}

async function generateMaze(ndim, generation_method, numExits) {
    generationOn();
    initMaze(ndim);
    await generation_method(ndim);
    await GenMethods._make_exits(ndim, numExits);
    generationOff();
}

function generationOn() {
    inGeneration = true;
    generateBtn.style.backgroundColor = "red";
}

function generationOff() {
    inGeneration = false;
    generateBtn.style.backgroundColor = "";
}

const GenMethods = {
    "_make_exits": async function(ndim, numExits) {
        let wallCoordFormats = [
            [0, undefined],
            [ndim - 1, undefined],
            [undefined, 0],
            [undefined, ndim - 1]
        ]
        let k = getRndInteger(0, wallCoordFormats.length);
        const randIndPool = [];
        for (let i = 1; i < ndim - 1; i += 2) {
            randIndPool.push(i);
        }
        for (let i = 0; i < numExits; i++, k = (k + 1) % 4) {
            let randPoolIndex = getRndInteger(0, randIndPool.length);
            let randExitIndex = randIndPool[randPoolIndex];
            randIndPool.splice(randPoolIndex, 1);
            let curFormat = [...wallCoordFormats[k]]
            curFormat[curFormat.indexOf(undefined)] = randExitIndex;
            changeCell(...curFormat, CellType.passage);
            await sleep(animDelay);
        }
    },
    "_fill_all": function (ndim, type) {
        for (let r = 0; r < ndim; r++) {
            for (let c = 0; c < ndim; c++) {
                changeCell(r, c, type);
            }
        }
    },
    "_base_depth_first_search": async function (ndim, backtrack_index_function) {
        // Fill everything with walls
        GenMethods._fill_all(ndim, CellType.wall);

        // Initialize stack
        let activeCells = [];

        // Choose a random starting point
        let startRow = getRndInteger(1, ndim, 2);
        let startCol = getRndInteger(1, ndim, 2);;
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
                if (newRowCoord >= 1 && newRowCoord < ndim - 1 && newColCoord >= 1 && newColCoord < ndim - 1
                    && mazeArr[newRowCoord][newColCoord].classList.contains("wall")) {
                        changeCell(midRowCoord, midColCoord, CellType.passage);
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
    },
    "last_depth_first_search": async function (ndim) {
        await GenMethods._base_depth_first_search(ndim, (length) => length - 1);
    },
    "breadth_first_search": async function (ndim) {
        await GenMethods._base_depth_first_search(ndim, (length) => 0);
    },
    "random_depth_first_search": async function (ndim) {
        await GenMethods._base_depth_first_search(ndim, (length) => getRndInteger(0, length));
    },
    "mixed_depth_first_search": async function (ndim) {
        await GenMethods._base_depth_first_search(ndim, (length) =>
            Math.random() > 0.35 ? length - 1 : getRndInteger(0, length));
    },
    "binary_tree": async function (ndim) {
        GenMethods._fill_all(ndim, CellType.wall);
        for (let r = ndim - 2; r >= 1; r -= 2) {
            for (let c = ndim - 2; c >= 1; c -= 2) {
                changeCell(r, c, CellType.passage);
                await sleep(animDelay);
                if (r - 1 < 1 && c - 1 < 1) {
                    break;
                }
                if (r - 1 < 1) {
                    changeCell(r, c - 1, CellType.passage);
                } else if (c - 1 < 1) {
                    changeCell(r - 1, c, CellType.passage);
                } else {
                    if (Math.random() > 0.5) {
                        changeCell(r, c - 1, CellType.passage);
                    } else {
                        changeCell(r - 1, c, CellType.passage);
                    }
                }
            } 
        }
    },
    "_recursive_division_helper": async function (rowStart, rowEnd, colStart, colEnd) {
        let rowDiff = rowEnd - rowStart;
        let colDiff = colEnd - colStart;
        if (rowDiff < 2 || colDiff < 2) {
            return;
        }
        if (rowDiff > colDiff) {
            let randomWallRow = getRndInteger(rowStart + 1, rowEnd, 2);
            let randomPassageCol = getRndInteger(colStart, colEnd + 1, 2);
            for (let c = colStart; c <= colEnd; c++) {
                if (c == randomPassageCol)
                    continue;
                changeCell(randomWallRow, c, CellType.wall);
                await sleep(animDelay);
            }
            await GenMethods._recursive_division_helper(rowStart, randomWallRow - 1, colStart, colEnd);
            await GenMethods._recursive_division_helper(randomWallRow + 1, rowEnd, colStart, colEnd);
        } else {
            let randomWallCol = getRndInteger(colStart + 1, colEnd, 2);
            let randomPassageRow = getRndInteger(rowStart, rowEnd + 1, 2);
            for (let r = rowStart; r <= rowEnd; r++) {
                if (r == randomPassageRow)
                    continue;
                changeCell(r, randomWallCol, CellType.wall);
                await sleep(animDelay);
            }
            await GenMethods._recursive_division_helper(rowStart, rowEnd, colStart, randomWallCol - 1);
            await GenMethods._recursive_division_helper(rowStart, rowEnd, randomWallCol + 1, colEnd);
        }
    },
    "recursive_division": async function (ndim) {
        await GenMethods._recursive_division_helper(1, ndim - 2, 1, ndim - 2);
    }
};

// main script
initMaze(2 * parseInt(sizeInput.value) + 1);

sizeInput.onchange = () => {
    let newDim = 2 * parseInt(sizeInput.value) + 1;
    if (newDim <= MAX_MAZE_SIZE) {
        initMaze(2 * parseInt(sizeInput.value) + 1);
    }
}

generateBtn.onclick = () => {
    // converting the input (dimension of the passage grid) to maze grid dimension including exterior walls
    let nsize = parseInt(sizeInput.value);
    let ndim = 2 * nsize + 1;
    let method = methodInput.value;
    let numExits = numExitsInput.value;

    if (!validateInput(nsize, numExits)) {
        return;
    }

    if (!inGeneration)
        generateMaze(ndim, GenMethods[method], numExits);
};


function validateInput(nsize, numExits) {
    if (nsize > MAX_MAZE_SIZE) {
        alert('Maze size too large!');
        return false;
    }
    // artificial restriction due to _make_exits implementation, more exits would be redundant
    if (numExits > nsize) {
        alert('Too many exits!');
        return false;
    }
    return true;
}
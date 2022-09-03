"use strict";
import { sleep, getRndInteger } from './utility_functions.js';

const mazeGrid = document.getElementById('mazeGrid');
const generateBtn = document.getElementById('generateBtn');
const sizeInput = document.getElementById('mazeSize');
const methodInput = document.getElementById('methodSelect');
const numExitsInput = document.getElementById('numExits');

// declarations
let mazeArr = null;
let animDelay = 5;
let inGeneration = false;

const CellType = {
    passage: "passage",
    wall: "wall",
};

const Type2Col = {
    "passage": "white",
    "wall": "black",
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
                changeCell(r, c, CellType.blank);
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
    initMaze(ndim);
    generation_method(ndim);
    GenMethods._make_exits(ndim, numExits);
}

const GenMethods = {
    "_make_exits": function(ndim, numExits) {
        // IMPLEMENT MAKE EXITS
    },
    "_fill_all": function (ndim, type) {
        for (let r = 0; r < ndim; r++) {
            for (let c = 0; c < ndim; c++) {
                changeCell(r, c, type);
            }
        }
    },
    "_base_depth_first_search": async function (ndim, backtrack_index_function) {
        inGeneration = true;
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
        inGeneration = false;
    },
    "last_depth_first_search": function (ndim) {
        GenMethods._base_depth_first_search(ndim, (length) => length - 1);
    },
    "breadth_first_search": function (ndim) {
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

        inGeneration = false;
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
        inGeneration = true;
        await GenMethods._recursive_division_helper(1, ndim - 2, 1, ndim - 2);
        inGeneration = false;
    }
};

// main script
initMaze(10);
// TO-DO: change button color while animation playing, add button to toggle exit/entrance generation
generateBtn.addEventListener('click', () => {
    // converting the input (dimension of the passage grid) to maze grid dimension including exterior walls
    let ndim = 2 * parseInt(sizeInput.value) + 1;
    let method = methodInput.value;
    let numExits = numExitsInput.value;
    if (!inGeneration)
        generateMaze(ndim, GenMethods[method], numExits);
});
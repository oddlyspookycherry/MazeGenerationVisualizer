"use strict";
import { sleep, getRndInteger } from '/utility_functions.js';

const mazegrid = document.getElementById('mazegrid');
const generateBtn = document.getElementById('generateBtn');
const nrowsinput = document.getElementById('nRows');
const ncolsinput = document.getElementById('nCols');
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

function initMaze(nrows, ncols) {
    mazegrid.innerHTML = '';
    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    mazeArr = new Array(nrows);
    for (let i = 0; i < mazeArr.length; i++) {
        mazeArr[i] = new Array(ncols);
    }

    // filling maze with blanks
    for (let r = 0; r < nrows; r++) {
        for (let c = 0; c < ncols; c++) {
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

async function generateMaze(nrows, ncols, generation_method) {
    initMaze(nrows, ncols);
    generation_method(nrows, ncols);
}

const GenMethods = {
    "all_passages": function (nrows, ncols) {
        inGeneration = true;
        for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
                changeCell(r, c, CellType.passage);
            }
        }
        inGeneration = false;
    },
    "all_walls": function (nrows, ncols) {
        inGeneration = true;
        for (let r = 0; r < nrows; r++) {
            for (let c = 0; c < ncols; c++) {
                changeCell(r, c, CellType.wall);
            }
        }
        inGeneration = false;
    },
    "randomized_depth_first_search": async function (nrows, ncols) {
        inGeneration = true;
        // Fill everything with walls
        GenMethods.all_walls(nrows, ncols);

        // Initialize stack
        let activeCells = [];

        // Choose a random starting point
        let startRow = getRndInteger(0, nrows);
        let startCol = getRndInteger(0, ncols);
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
            let curInd = Math.random() > 0.5 ? activeCells.length - 1 : getRndInteger(0, activeCells.length);
            let curCoordnates = activeCells[curInd];

            let randDirInd = getRndInteger(0, directions.length);
            let validDir = false;
            // Check if new coordinates are valid
            for (let i = 0; i <= 4; i++) {
                let randDir = directions[(randDirInd + i) % directions.length];
                let [rowStep, colStep] = randDir;
                let midRowCoord = curCoordnates[0] + rowStep;
                let midColCoord = curCoordnates[1] + colStep;
                let newRowCoord = curCoordnates[0] + 2 * rowStep;
                let newColCoord = curCoordnates[1] + 2 * colStep;
                if (newRowCoord >= 0 && newRowCoord < nrows && newColCoord >= 0 && newColCoord < ncols
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
    "recursive_division": async function (nrows, ncols) {
        inGeneration = true;
        GenMethods.all_passages(nrows, ncols);
        await GenMethods.separate_chamber(0, 0, nrows - 1, ncols - 1);
        inGeneration = false;
    },
    "separate_chamber": async function (bottomLeftRow, bottomLeftCol, topRightRow, topRightCol) {
        if (bottomLeftRow == topRightRow || bottomLeftCol == topRightCol) {
            return;
        }
        let randRowInd = getRndInteger(bottomLeftRow, topRightRow + 1);
        let randColInd = getRndInteger(bottomLeftCol, topRightCol + 1);
        for (let i = bottomLeftRow; i <= topRightRow; i++) {
            changeCell(i, randColInd);
        }
        for (let i = bottomLeftCol; i <= topRightCol; i++) {
            changeCell(randRowInd, i);
        }
        GenMethods.separate_chamber(bottomLeftRow, bottomLeftCol, randRowInd, randColInd);
        GenMethods.separate_chamber(randRowInd, randColInd, topRightRow, topRightCol);
        // GenMethods.separate_chamber(bottomLeftRow, randColInd, topRightRow, randColInd);
        // GenMethods.separate_chamber(bottomLeftRow, bottomLeftCol, randRowInd, randColInd);
    }
};

// main script
// TO-DO: change button color while animation playing
generateBtn.addEventListener('click', () => {
    let nrows = parseInt(nrowsinput.value);
    let ncols = parseInt(ncolsinput.value);
    let method_name = methodinput.value;
    if (!inGeneration)
        generateMaze(nrows, ncols, GenMethods[method_name]);
});
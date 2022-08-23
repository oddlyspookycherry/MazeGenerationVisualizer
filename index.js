const mazegrid = document.getElementById('mazegrid')
const generate_btn = document.getElementById('generate btn')
const nrowstext = document.getElementById('n rows')
const ncolstext = document.getElementById('n cols')

generate_btn.addEventListener('click', () => {
    nrows = nrowstext.value
    ncols = ncolstext.value
    // use css vars?
    mazegrid.style.gridTemplate = `repeat(${nrows}, 1fr) / repeat(${ncols}, 1fr)`;
    mazegrid.innerHTML = ''
    for (let i = 0; i < nrows * ncols; i++) {
        const gridcell = document.createElement('div')
        gridcell.classList.add('gridcell')
        mazegrid.appendChild(gridcell)
    }
})
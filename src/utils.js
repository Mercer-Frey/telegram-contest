import {DPI_HEIGHT, DPI_WIDTH, PADDING} from "./config";

export function isOver(mouse, x, length) {
    if (!mouse) return false
    const width = DPI_WIDTH / length
    return Math.abs(x - mouse.x) < width / 2
}

export function toCoords(xRatio, yRatio) {
    return (col) => col.map((y, i) =>
        [Math.floor((i - 1) * xRatio), Math.floor(DPI_HEIGHT - PADDING - y * yRatio)])
        .filter((_, i) => i !== 0)
}

export function toDate(timestamp) {
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',]
    const date = new Date(timestamp)
    return `${shortMonths[date.getMonth()]} ${date.getDate()}`
}

export function boundaries({columns, types}) {
    let min, max

    columns.forEach(col => {
        if (types[col[0]] !== 'line') return

        if (typeof min !== 'number') min = col[1]
        if (typeof max !== 'number') max = col[1]

        if (min > col[1]) min = col[1]
        if (max < col[1]) max = col[1]

        for (let i = 2; i < col.length; i++) {
            if (min > col[i]) min = col[i]
            if (max < col[i]) max = col[i]
        }
    })
    return [min, max]
}

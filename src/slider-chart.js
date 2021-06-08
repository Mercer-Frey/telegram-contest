import {boundaries, css, line, toCoords} from "./utils";
import {DPI_HEIGHT_SLIDER, DPI_WIDTH, HEIGHT_SLIDER, WIDTH} from "./config";
import {getChartData} from "./data";

export class SliderChart {
    constructor(root, data) {
        this.data = data
        this.canvas = root.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')

        css(this.canvas, {width: `${WIDTH}px`, height: `${HEIGHT_SLIDER}px`})
        this.canvas.height = DPI_HEIGHT_SLIDER
        this.canvas.width = DPI_WIDTH

        const [yMin, yMax] = boundaries(getChartData())
        const yRatio = DPI_HEIGHT_SLIDER / (yMax - yMin)
        const xRatio = DPI_WIDTH / (getChartData().columns[0].length - 2)
        const yData = this.data.columns.filter(col => this.data.types[col[0]] === 'line')

        yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT_SLIDER, -7))
            .forEach((coords, i) => {
                const color = this.data.colors[yData[i][0]]
                line(this.ctx, coords, {color})
            })
    }
}

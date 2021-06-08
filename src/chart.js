import {getChartData} from "./data";
import {boundaries, css, isOver, toCoords, toDate} from "./utils";
import {
    CIRCLE_RADIUS,
    COLS_COUNT,
    DPI_HEIGHT,
    DPI_WIDTH,
    HEIGHT,
    MULTIPLE,
    PADDING,
    ROWS_COUNT,
    VIEW_HEIGHT,
    VIEW_WIDTH,
    WIDTH,
} from "./config";
import {Tooltip} from "./tooltip";

export class Chart {
    constructor(root, data) {
        this.tip = new Tooltip(root.querySelector('[data-el="tooltip"]'))
        this.canvas = root.querySelector('[data-el="main"]')
        this.ctx = this.canvas.getContext('2d')
        this.data = data

        this.proxy = this.proxyMouseMove()
        this.canvas.addEventListener('mousemove', e => this.mousemove(e))
        this.canvas.addEventListener('mouseleave', () => this.mouseleave())

        css(this.canvas, {width: `${WIDTH}px`, height: `${HEIGHT}px`})
        this.canvas.height = DPI_HEIGHT
        this.canvas.width = DPI_WIDTH
    }

    init() {
        this.paint()
    }

    proxyMouseMove() {
        const paint = this.paint.bind(this)
        return new Proxy({}, {
            set(...args) {
                requestAnimationFrame(paint)
                return Reflect.set(...args)
            }
        })
    }

    mousemove({clientX, clientY}) {
        const {left, top} = this.canvas.getBoundingClientRect()
        this.proxy.mouse = {
            x: (clientX - left) * MULTIPLE,
            tooltip: {left: clientX - left, top: clientY - top}
        }
    }

    mouseleave() {
        this.proxy.mouse = null
        this.tip.hide()
    }

    paint() {
        this.clear()
        const [yMin, yMax] = boundaries(getChartData())
        const yRatio = VIEW_HEIGHT / (yMax - yMin)
        const xRatio = VIEW_WIDTH / (getChartData().columns[0].length - 2)
        const yData = this.data.columns.filter(col => this.data.types[col[0]] === 'line')
        const xData = this.data.columns.filter(col => this.data.types[col[0]] !== 'line')[0]

        this.yAxis(yMin, yMax)
        this.xAxis(xData, yData, xRatio)

        yData.map(toCoords(xRatio, yRatio))
            .forEach((coords, i) => {
                const color = this.data.colors[yData[i][0]]
                this.line(coords, {color})
                for (const [x, y] of coords) {
                    if (isOver(this.proxy.mouse, x, coords.length)) {
                        this.circle([x, y], color)
                        break
                    }
                }
            })
    }

    yAxis(yMin, yMax) {
        const step = VIEW_HEIGHT / ROWS_COUNT
        const textStep = (yMax - yMin) / ROWS_COUNT
        this.ctx.beginPath()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = '#bbb'
        this.ctx.fillStyle = '#96a2aa'
        this.ctx.font = 'normal 20px Helvetica, sans-serif'
        for (let i = 1; i <= ROWS_COUNT; i++) {
            const y = step * i
            const text = Math.round(yMax - textStep * i)
            this.ctx.fillText(text.toString(), 5, y + PADDING - 5)
            this.ctx.moveTo(0, y + PADDING)
            this.ctx.lineTo(DPI_WIDTH, y + PADDING)
        }
        this.ctx.stroke()
        this.ctx.closePath()
    }

    xAxis(xData, yData, xRatio) {
        const step = Math.round(xData.length / COLS_COUNT)
        this.ctx.beginPath()
        for (let i = 1; i < xData.length; i++) {
            const x = i * xRatio

            if ((i - 1) % step === 0) {
                const text = toDate(xData[i])
                this.ctx.fillText(text.toString(), x, DPI_HEIGHT - 5)
            }

            if (isOver(this.proxy.mouse, x, xData.length)) {
                this.ctx.save()
                this.ctx.moveTo(x, PADDING)
                this.ctx.lineTo(x, DPI_HEIGHT - PADDING)
                this.ctx.restore()

                this.tip.show(this.proxy.mouse.tooltip, {
                    title: toDate(xData[i]),
                    items: yData.map(col => ({
                        color: this.data.colors[col[0]],
                        name: this.data.names[col[0]],
                        value: col[i + 1]
                    }))
                })
            }
        }
        this.ctx.stroke()
        this.ctx.closePath()
    }

    line(coords, {color}) {
        this.ctx.beginPath()
        this.ctx.lineWidth = 4
        this.ctx.strokeStyle = color
        for (const [x, y] of coords) this.ctx.lineTo(x, y)
        this.ctx.stroke()
        this.ctx.closePath()
    }

    circle([x, y], color) {
        this.ctx.beginPath()
        this.ctx.strokeStyle = color
        this.ctx.fillStyle = '#fff'
        this.ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2)
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.closePath()
    }

    clear() {
        this.ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', () => this.mousemove)
        this.canvas.removeEventListener('mouseleave', () => this.mouseleave)
    }

}

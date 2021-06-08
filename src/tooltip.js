import {css} from "./utils";

export class Tooltip {
    constructor(el) {
        this.el = el
    }

    clear() {
        (this.el.innerHTML = '')
    }

    show({left, top}, data) {
        const {height, width} = this.el.getBoundingClientRect()
        this.clear()
        css(this.el, {
            display: 'block',
            top: top - height + 'px',
            left: left + width / 2 + 'px',
        })
        this.el.insertAdjacentHTML('afterbegin', this.template(data))
    }

    hide() {
        css(this.el, {display: 'none'})
    }

    template(data) {
        return `<div class="tooltip-title">${data.title}</div>
            <ul class="tooltip-list">
                ${data.items.map((item) =>
            `<li class="tooltip-list-item">
                        <div class="value" style="color: ${item.color}">${item.value}</div>
                        <div class="name" style="color: ${item.color}">${item.name}</div>
                    </li>`).join('\n')}
            </ul>`
    }
}

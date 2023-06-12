import { Events } from './events.js'

export class CustomCheckBox extends HTMLElement {

    _index;

    connectedCallback() {
        this._index = this.getAttribute("index");
        this.addEventListener('click', this._onClick.bind(this))
        this.innerHTML = this.html;
    }

    _onClick() {
        Events.invoke(this, 'select')
    }

    get index() {
        return this._index;
    }

    get selected() {
        return this.querySelector('input').checked;
    }

    get html() {
        return `<input type='checkbox' style="cursor:pointer"/>`
    }
}

customElements.define('custom-check-box', CustomCheckBox);
import { Events } from './events.js'

export class CustomCheckBox extends HTMLElement {

    _index;
    _data

    connectedCallback() {
        this._index = this.getAttribute("index");
        this._data = this.getAttribute("data");
        this.addEventListener('click', this._onClick.bind(this))
        Events.invoke(this, 'registercheckbox')
        this.innerHTML = this.html;
    }

    _onClick() {
        Events.invoke(this, 'select')
    }

    check(){
        this.querySelector('input').checked = true;
    }

    uncheck(){
        this.querySelector('input').checked = false;
    }

    get index() {
        return this._index;
    }

    get data(){
        return this._data;
    }

    get selected() {
        return this.querySelector('input').checked;
    }

    get html() {
        return `<input type='checkbox' style="cursor:pointer"/>`
    }
}

customElements.define('custom-check-box', CustomCheckBox);
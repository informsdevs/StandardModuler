import { SingleRecordComponent } from "./component.js";
import { Events } from "./events.js";

class CustomInputField extends SingleRecordComponent {


    _attributes = [
        { attribute: 'type', type: 'text', callback: this._setType.bind(this) },
        { attribute: 'index', type: 'text', callback: this._setIndex.bind(this) },
        { attribute: 'data', type: 'text', callback: this._setData.bind(this) },
        { attribute: 'column', type: 'text', callback: this._setColumn.bind(this) }]

    _config = {
        readonly: false,
        empty: false
    }
    
    _type;
    _index;

    connectedCallback(){
        super.connectedCallback();
        Events.invoke(this, 'registerinput')
        super.render();
    }

    disable(){
        this.querySelector('input').disabled = true; 
    }

    enable(){
        this.querySelector('input').disabled = false;
    }

    _setColumn(column){
        this._column = column;
    }

    _setType(type) {
        this._type = type;
    }

    _setIndex(index) {
        this._index = index;
    }
    _setData(data){
        this._data = data;
    }

    get data(){
        return this._data;
    }

    get column(){
        return this._column;
    }

    get index(){
        return this._index;
    }

    get disabled(){
        return this.querySelector('input').disabled;
    }

    get value(){
        return this.querySelector('input').value;
    }

    get html() {
        return `<input type=${this._type} ${this._config.readonly ? 'disabled' : ''} ${!this._config.empty ? `value='${this.data ?? ""}'` : this._type === 'number' ? `value="0"` : ""}/>`
    }
}

customElements.define('custom-input-field', CustomInputField);
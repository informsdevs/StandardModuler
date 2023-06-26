import { RecordListComponent, Component } from "./component.js";
import { Events } from "./events.js"

export class SearchContainer extends RecordListComponent {

    _searchFields = [];

    _eventListeners = [
        { type: 'keyup', callback: this._onKeyUp.bind(this) },
        { type: 'register', callback: this._registerSearchField.bind(this) },
        { type: 'change', callback: this._onKeyUp.bind(this)}]


    _onKeyUp() {
        this.update(this._records, this._columns)
    }

    _filter() {
        return this._records.filter(record =>
            this._searchFields.every(field => {
                return record.attributes.find(attr => attr.name === field.column).data.toUpperCase().includes(field.searchPhrase.toUpperCase())
            })
        )
    }

    update(records, columns) {
        super.update(records, columns);
        this._updateWatchers(this._filter(), columns)
    }

    _registerSearchField(e) {
        this._searchFields.push(e.target)
    }

}

customElements.define('search-container', SearchContainer);

export class SearchField extends HTMLElement {

    _column;


    _initializers = [
        { attribute: 'column', callback: this._selectColumn.bind(this) }]


    connectedCallback() {
        this._initializers.forEach(initializer => {
            if (this.getAttribute(initializer.attribute)) {
                initializer.callback(this.getAttribute(initializer.attribute))
            }
        })
        this.innerHTML = this.html;
        Events.invoke(this, 'register')
    }

    _selectColumn(column) {
        this._column = column;
    }


    get column() {
        return this._column;
    }

    get searchPhrase() {
        return this.querySelector('input').value ?? "";
    }

    get html() {
        return `<input class="${this._classes}" type="text" placeholder="Search by ${this._column}"/>`
    }


}

customElements.define('search-field', SearchField);

class SearchRadioButton extends Component {

    _id = uuid.v4();
    _column
    _config = {
        noFilter : false
    }

    _attributes = [
        { attribute: 'column', type: 'text', callback: this._selectColumn.bind(this) },
        { attribute: 'column', type: 'text', callback: this._selectColumn.bind(this) }

      ]

      connectedCallback() {
        super.connectedCallback();
        super.render();
        Events.invoke(this, 'register')
    }

      _selectColumn(column) {
        this._column = column;
    }

    
    get column() {
        return this._column;
    }

    get searchPhrase() {
        return this.querySelector('input[type="radio"]').checked && !this._config.noFilter ? this._name : "";
    }


    get html(){
        return ` <div class="form-check ${this._classes}">
        <input class="form-check-input" type="radio" name="radio" id="radio-${this._id}">
        <label class="form-check-label" for="radio-${this._id}">
          ${this._name}
        </label>
      </div>`
    }

}

customElements.define('search-radio-button', SearchRadioButton);
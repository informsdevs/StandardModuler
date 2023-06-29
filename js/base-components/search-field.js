import { RecordListComponent, Component } from "./component.js";
import { Events } from "./events.js"

export class SearchContainer extends RecordListComponent {

    _searchFields = [];

    _eventListeners = [
        { type: 'keyup', callback: this._onKeyUp.bind(this) },
        { type: 'register', callback: this._registerSearchField.bind(this) },
        { type: 'change', callback: this._onKeyUp.bind(this)},
        { type: 'click', callback: this._onKeyUp.bind(this)},
        { type: 'getrecords', callback: this._getRecords}]


    _onKeyUp() {
        this._updateWatchers(this._filter(), this._columns)
    }

    _getRecords(e){
        e.detail.callback(this._records);
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
        this._searchFields.forEach(field => field.update(records));
        this._updateWatchers(this._filter(), columns)
    }

    _registerSearchField(e) {
        this._searchFields.push(e.target)
    }

}

customElements.define('search-container', SearchContainer);

export class AutoPopulatedSearchContainer extends SearchContainer {

    defineColumns(columns){
        this._selectColumns(columns);
        super.render();
    }

    get html(){
        return this._selectedColumns.map(column => `<search-field column="${column}"></search-field>`).join('')
    }

}

customElements.define('auto-populated-search-container', AutoPopulatedSearchContainer);

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


export class SearchGroup extends RecordListComponent {

    _items = [];

    _attributes = [
        { attribute: 'column', type: 'text', callback: this._selectColumn.bind(this) },
        { attribute: 'items', type: 'json', callback: this._addItems.bind(this) } 
    ]


    async connectedCallback(){
        super.connectedCallback();
        Events.invoke(this, 'register');
        super.render();   
    }

    async update(){
        if (this._items.length === 0){
            this._records = await Events.getAsync(this, 'getrecords');
            this._items = [...new Set(this._records.map(record => {
                const attr = record.attributes.find(attribute => attribute.name === this._column);
                return attr.data
                }))]
          }
          super.render();
    }

    _addItems(items){
        this._items = items;
    }

    _selectColumn(column) {
        this._column = column;
    }

    get column(){
        return this._column;
    }


}



export class SearchRadioGroup extends SearchGroup {

    _eventListeners = [
        { type: 'click', callback: this._onClick.bind(this)}]


    _onClick(e){
        this._searchPhrase = e.target.getAttribute(":name");
    }

    get searchPhrase(){
        return this._searchPhrase ?? "";
    }

    get html(){
        return `${this._items.map(item => `<search-radio-button name="${item}"></search-radio-button>`).join('')}`
    }

}

customElements.define('search-radio-group', SearchRadioGroup);
export class SearchRadioButton extends Component {

    _id = uuid.v4();
    _config = {
        noFilter : false
    }

 
      connectedCallback() {
        super.connectedCallback();
        super.render();
    }
   

    get html(){
        return ` <div class="form-check ${this._classes}">
        <input class="form-check-input" :name="${this._name}" type="radio" name="radio" id="radio-${this._id}">
        <label class="form-check-label" for="radio-${this._id}">${this._name}</label>
      </div>`
    }

}

customElements.define('search-radio-button', SearchRadioButton);

export class SearchDropDown extends SearchGroup {


    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    _onClick(e){
        this._searhPhrase = e.target.name;
    }

    get searchPhrase(){
        return this._searhPhrase ?? "";
    }


    get html(){
       return `<div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          ${this._name}
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        ${this._items.map(item => `<a class="dropdown-item" name="${item}" href="#">${item}</a>`).join('')}
        </div>
      </div>`
    }

}

customElements.define('search-drop-down', SearchDropDown);


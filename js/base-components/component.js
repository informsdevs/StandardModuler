export class Component extends HTMLElement {

    _name;
    _classes = "";
    _watchers = [];
    _eventListeners = [];
    _attributes = [];
    _features;
    _config;
    _sharedEventListeners = [];
    _selectedColumns = [];

    _sharedAttributes = [
        { attribute: 'column-select', type: "json", callback: this._selectColumns.bind(this) },
        { attribute: 'listen', type: "text", callback: this._subscribe.bind(this) },
        { attribute: 'config', type: 'json', callback: this._addConfigAttributes.bind(this) },
        { attribute: 'features', type: 'json', callback: this._addFeatures.bind(this) },
        { attribute: 'name', type: 'text', callback: this._setName.bind(this) },
        { attribute: ':class', type: 'text', callback: this._addClasses.bind(this) }]


    connectedCallback() {
        this._initializeAttributes();
        this._addEventListeners();
    }

    _initializeAttributes() {
        this._sharedAttributes.concat(this._attributes).forEach(initializer => {
            let attribute = this.getAttribute(initializer.attribute);
            if (attribute) {
                if (initializer.type === 'json') attribute = JSON.parse(attribute);
                initializer.callback(attribute)
            }
        })
    }

    _selectColumns(columns){
        this._selectedColumns = columns;
    }

    _addEventListeners() {
        this._sharedEventListeners.concat(this._eventListeners).forEach(eventListener => {
            this.addEventListener(eventListener.type, eventListener.callback.bind(this))
        })
    }

    _addClasses(classes){
       this._classes = classes;
    }

    _setName(name) {
        this._name = name;
    }


    _getRecordAttributes(record){
        if (this._selectedColumns.length === 0) return record.attributes;
        return record.attributes.filter(attribute => this._selectedColumns.includes(attribute.name))
    }

    _selectProperties(properties) {
        this._columns = this._columns.filter(prop => properties.includes(prop.name));
    }

    _subscribe(elementId) {
        document.addEventListener("DOMContentLoaded", () => {
            document.getElementById(elementId).register(this);
        })
    }

    _addFeatures(features) {
        features.forEach(feature => this._addFeature(feature));
    }

    _addFeature(feature) {
        if (this._features.hasOwnProperty(feature)) {
            this._features[feature] = true;
        }
    }

    _addConfigAttributes(configAttributes) {
        configAttributes.forEach(attr => this._addConfigAttribute(attr));
    }

    _addConfigAttribute(attr) {
        if (this._config.hasOwnProperty(attr)) {
            this._config[attr] = true;
        }
    }

    register(watcher) {
        this._watchers.push(watcher);
    }

    render() {
        this.innerHTML = this.html;
    }

}

export class RecordListComponent extends Component {

    _records = [];
    _columns = []; 

    

    _updateWatchers(records, columns) {
        this._watchers.forEach(
            watcher => watcher.update([...records], [...columns]))
    }

    update(records, columns) {
        this._records = records;
        this._columns = columns;
    }

    get columns(){
        if (this._selectedColumns.length === 0) return this._columns;
        return this._columns.filter(column => this._selectedColumns.includes(column.name));
    }


}


export class SingleRecordComponent extends Component {

    _record;
    _column;

    _updateWatcher(record, column) {
        this._watchers.forEach(
            watcher => watcher.update(record, column))
    }

    update(record, column) {
        this._record = record;
        this._column = column;
    }

}


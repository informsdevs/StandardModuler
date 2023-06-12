export class Component extends HTMLElement {

    _records;
    _columns;
    _watchers = [];
    _listeners = [];
    _eventListeners = [];
    _initializers = [];

    _attributeInitializers = [
         { attribute: 'listen', type: "text", callback: this._subscribe.bind(this) }]


    connectedCallback(){
        this._initializeAttributes();
        this._addEventListeners();
    }

    _initializeAttributes() {
        this._attributeInitializers.concat(this._initializers).forEach(initializer => {
            let attribute = this.getAttribute(initializer.attribute);
            if (attribute) {
                if (initializer.type === 'json') attribute = JSON.parse(attribute);
                initializer.callback(attribute)
            }
        })
    }

    _addEventListeners() {
        this._listeners.concat(this._eventListeners).forEach(eventListener => {
            this.addEventListener(eventListener.type, eventListener.callback.bind(this))
        })
    }

    _selectProperties(properties) {
        this._columns = this._columns.filter(prop => properties.includes(prop.name));
    }

    _subscribe(elementId) {
        document.addEventListener("DOMContentLoaded", () => {
            document.getElementById(elementId).register(this);
        })
    }

    _updateWatchers(records, columns){
        this._watchers.forEach(
            watcher => watcher.update([...records], [...columns]))
    }

    register(watcher) {
        this._watchers.push(watcher);
    }

    update(records, columns){
        this._records = records;
        this._columns = columns;
    }

    render() {
        this.innerHTML = this.html;
    }

}


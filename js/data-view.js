class DataView {

    static _globalId = 1;

    _dataViewName = `DataView-${this._globalId++}`
    _propReferencedBy = "key";
    _dataArray;
    _dialog = new Dialog();
    _properties = [];
    _unitButtons = [];
    _identifier;
    _pipeline = {
        postFetch: [],
        preRender: [],
        preMount: [],
        postMount: [],
        postRender: []
    }

    constructor(apiClient, types) {
        this.apiClient = apiClient;
        this.types = types;
        this._initializeProperties();
    }

    selectMainViewProperties(...selectedProperties) {
        this._properties.forEach(prop => prop.mainView = selectedProperties.includes(prop[this._propReferencedBy]));
        return this;
    }

    selectDialogViewProperties(...selectedProperties) {
        this._properties.forEach(prop => prop.dialogView = selectedProperties.includes(prop[this._propReferencedBy]));
        return this;
    }

    _getKey(key) {
        return this._getProp(key).key;
    }

    _changeProp(property, type, newVal) {
        this._getProp(property)[type] = newVal;
    }

    _addProp(...params) {
        this._properties.push(new Property(...params));
    }

    _sort(property, descending) {
        this._dataArray.sort((a, b) => {
            return a[this._getKey(property)] >= b[this._getKey(property)] && descending || a[this._getKey(property)] < b[this._getKey(property)] && !descending ? -1 : 1;
        })
    }

    editRecord(record, id) {
        console.log(record);
        console.log(id)
    }

    addSingleUnitButtons() {
        this._unitButtons.push(ViewButton, EditButton);
        this._pipeline.postMount.push(() => this.el.addEventListener("edit", (e) => this.editRecord(e.record, e.id)))
        this._dialog = new Dialog();
        return this;
    }

    selectIdentifier(id) {
        this._identifier = id;
        this._getProp(id).readonly = true;
        return this;
    }

    referencePropByName() {
        this._propReferencedBy = "name";
        return this;
    }

    referencePropByKey() {
        this._propReferencedBy = "key";
        return this;
    }

    sortInDescendingOrder(property) {
        this._pipeline.postFetch.push(() => this._sort(property, true))
        return this;
    }

    sortInAscendingOrder(property) {
        this._pipeline.postFetch.push(() => this._sort(property, false))
        return this;
    }

    renameProperty(property, name) {
        this._changeProp(property, "name", name);
        return this;
    }

    changePropertyType(property, type) {
        this._changeProp(property, "type", type);
        return this;
    }

    changePropertyTypes(properties, type) {
        properties.forEach(prop => this.changePropertyType(prop, type));
        return this;
    }

    renameProperties(...properties) {
        properties.forEach(prop => this.renameProperty(prop[0], prop[1]))
        return this;
    }

    addSumProperty(keys, name) {
        this._pipeline.postFetch.push(() => this._dataArray.map(data => {
            data[name] = keys.map(key => data[this._getKey(key)]).reduce((a, b) => a + b, 0)
        }))
        this._addProp(name, name, "number", true, true, true);
        return this;
    }

    addSendButton(callback) {
        this._unitButtons.push({ "type": SendButton, params: [callback] })
        return this;
    }


    _getMainViewProperties() {
        return this._properties.filter(prop => prop.mainView);
    }

    _getDialogViewProperties() {
        return this._properties.filter(prop => prop.dialogView);
    }

    _getProp(key) {
        return this._properties.find(prop => prop[this._propReferencedBy] === key);
    }

    _getDialogRecord(record) {
        const dialogRecords = [];
        this._getDialogViewProperties().forEach(prop => {
            dialogRecords.push({ name: prop.name, data: record[prop.key], type: prop.type, readonly: prop.readonly });
        });
        return dialogRecords;
    }

    _getContentList(record) {
        const contentList = [];
        this._getMainViewProperties().forEach(prop => contentList.push(record[prop.key]))
        return contentList;
    }

    _showDialog(e) {
        this._dialog.update(e.dialog)
        this._dialog.postRender();
        this._dialog.show()
    }


    _getDataUnits(...params) {
        return this._dataArray.map((record, index) => {
            return new this.types.DataUnit(this._getContentList(record), this._getDialogRecord(record), record[this._identifier], index, this._unitButtons, ...params);
        })
    }

    _initializeProperties() {
        this._properties = this.apiClient.getMetaData().map(prop => new Property(prop.key, prop.key, prop.type, true, true, false));
    }

    async _fetchData() {
        this._dataArray = await this.apiClient.getAllRecords();
    }

    _typeCastData() {
        this._properties.filter(prop => prop.type === "number").forEach(prop =>
            this._dataArray.forEach(record => record[prop.key] = parseInt(record[prop.key])))
    }

    _postFetch() {
        this._typeCastData();
        this._pipeline.postFetch.forEach(event => event());
    }

    _preRender() {
        this._pipeline.preRender.forEach(event => event());
    }

    _preMount() {
        this._pipeline.preMount.forEach(event => event());
    }

    _postMount() {
        this._pipeline.postMount.forEach(event => event());
        if (this._dialog) this.el.addEventListener('showDialog', this._showDialog.bind(this))
    }

    _postRender() {
        this._pipeline.postRender.forEach(event => event());
    }

    mount(id) {
        this._preMount();
        this.el = document.querySelector(id);
        this._postMount();
        this._update();
    }

    async _update(event) {
        await this._fetchData();
        this._postFetch();
        if (event) event()
        this._preRender();
        this.el.innerHTML = this.html();
        this._postRender();
    }

    html() {
        return `${this._dialog ? this._dialog.html() : ""}`;
    }

}

class Property {
    constructor(key, name, type, mainView, dialogView, readonly) {
        this.key = key;
        this.name = name;
        this.type = type;
        this.mainView = mainView;
        this.dialogView = dialogView;
        this.readonly = readonly;
    }
}

class Component {
    _id = `viewid-${uuid.v4()}`
    _el;

    postRender() {
        this._el = document.getElementById(this._id);
    }
}


class DataUnit extends Component {

    _contentList;
    _record;
    _index;
    _id
    _buttons = [];

    constructor(contentList, record, id, index, buttons) {
        super();
        this._contentList = contentList;
        this._index = index;
        this._record = record;
        this._id = id;
        this._buttons = buttons.map(button => new button())
    }

    attachDialog(e) {
        e.dialog = new e.dialogType(this._record, e.id = this._id)
    }

    postRender() {
        super.postRender();
        this._el.addEventListener('showDialog', this.attachDialog.bind(this))
        this._buttons.forEach(btn => btn.postRender());
    }
}

class Button extends Component {

    _name;

    constructor(name) {
        super();
        this._name = name;
    }

    postRender() {
        super.postRender();
        this._el.addEventListener('click', () => this.onClick());
    }

    html() {
        return `<button id="${this._id}" type="button">${this._name}</button>`
    }

}

class DialogAcceptButton extends Button {

    _eventName;
    _record;
    _id;

    constructor(name, eventName) {
        super(name);
        this._eventName = eventName;
    }

    onClick() {
        const acceptEvent = new Event("accept", { bubbles: true })
        this._el.dispatchEvent(acceptEvent);

        if (this._eventName) {
            const updateEvent = new Event(this._eventName, { bubbles: true })
            this._el.dispatchEvent(updateEvent);
        }
    }
}

class RowButton extends Button {

    _record;
    _dialogType;

    constructor(name, dialogType) {
        super(name);
        this._dialogType = dialogType;
    }

    onClick() {
        const event = new Event("showDialog", { bubbles: true });
        event.dialogType = this._dialogType;
        this._el.dispatchEvent(event);
    }
}


class ViewButton extends RowButton {

    constructor() {
        super("View", ViewDialog)
    }
}

class EditButton extends RowButton {

    constructor() {
        super("Edit", EditDialog)
    }
}


class DeleteButton extends Button {

    constructor() {
        super("Delete")
    }
}

class SendButton extends Button {

    _callback;
    _record;

    constructor(record, id, callback) {
        super("Send");
        console.log(callback)
        this._callback = callback;
        this._record = record;
    }

    onClick() {
        this._callback(this._record);
    }

}

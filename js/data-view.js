class DataView {

    static _globalId = 1;

    _dataViewName = `DataView-${DataView._globalId++}`
    _propReferencedBy = "key";
    _dataArray;
    _dialog;
    _recordInfoLabel;
    _sendCallback;
    _dataUnits = [];
    _properties = [];
    _unitButtons = [];
    _searchFields = [];
    _identifier;
    _pipeline = {
        postFetch: [],
        preRender: [],
        preMount: [],
        postMount: [],
        mountPostRender: [],
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

    addRecordInfoLabel(recordInfoLabel) {
        this._recordInfoLabel = recordInfoLabel;
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
        this._dataUnits.sort((a, b) => {
            return a.record[this._getKey(property)] >= b.record[this._getKey(property)] && descending || a.record[this._getKey(property)] < b.record[this._getKey(property)] && !descending ? -1 : 1;
        })
    }

    _updateRecordWithDataKeys(record) {
        const updatedRecord = {};
        this._getDialogViewProperties().forEach(prop => {
            if (record[prop.name]) updatedRecord[prop.key] = record[prop.name];
        })
        return updatedRecord;
    }

    async editRecord(record, id) {
        await this.apiClient.editRecord({ [this._identifier]: id, ...this._updateRecordWithDataKeys(record) });
    }

    async deleteRecord(id) {
        await this.apiClient.deleteRecord(id)
    }

    async acceptDialog(details) {
        if (details.event === "edit") await this.editRecord(details.record, details.id);
        if (details.event === "delete") await this.deleteRecord(details.id);
        this._update(0);
    }

    addSingleUnitButtons() {
        this._unitButtons.push({ type: ViewButton, params: [] }, { type: EditButton, params: [] }, { type: DeleteButton, params: [] });
        this._initializeDialog();
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
        this._unitButtons.push({ "type": SendButton, params: [] })
        this._sendCallback = callback;
        this._pipeline.postMount.push(() => this.el.addEventListener('send', this._onSend.bind(this)));
        return this;
    }

    addConditionalCssClass(prop, condition, value, cssClass) {
        this._pipeline.postRender.push(() => {
            this._dataUnits.forEach(dataUnit => {
                if (condition(dataUnit.record[this._getKey(prop)], value))
                    dataUnit.addCssClassToProperty(this._getKey(prop), cssClass);
            })
        })

        return this;
    }

    _onSend(e) {
        this._sendCallback(e.detail.record);
    }

    _initializeSearchFields() {
        this._pipeline.preRender.push(() => this._search());
        this._pipeline.mountPostRender.push(() => this.el.addEventListener('search', () => this._update(1)));
    }

    addSearchField(property) {
        this._searchFields.push(new SearchField(this._getProp(property)));
        this._initializeSearchFields();

        return this;
    }

    addSearchFields(...properties) {
        properties.forEach(prop => this._searchFields.push(new SearchField(this._getProp(prop))));
        this._initializeSearchFields();
        return this;
    }

    _initializeDialog() {
        if (!this._dialog) {
            this._dialog = new Dialog();
            this._pipeline.postMount.push(
                () => this.el.addEventListener("accept", (e) => this.acceptDialog(e.detail)),
                () => this.el.addEventListener('showDialog', (e) => this._showDialog(e.detail)))
        }
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
        return this._getMainViewProperties().map(prop =>{ return {key : prop.key, data: record[prop.key]}})
    }

    _getDialogLabel(record) {
        return record[this._getKey(this._recordInfoLabel)]
    }

    _updateDialog(dialog) {
        this._dialog.update(dialog)
        this._dialog.postRender();
        this._dialog.show()

    }

    _showDialog(detail) {
        const dialog = new detail.dialogType(this._getDialogRecord(detail.record), detail.recordId, this._getDialogLabel(detail.record))
        this._updateDialog(dialog);
    }

    _getRecordById(id) {
        return this._dataArray.find(record => record[this._identifier] === id);
    }

    _getRecordsByIds(ids) {
        return ids.map(id => this._getRecordById(id))
    }


    _generateDataUnits() {
        this._dataUnits = this._dataArray.map((record) => {
            return new this.types.DataUnit(this._getContentList(record), record, record[this._identifier], this._unitButtons, ...this.dataUnitParams);
        })
    }

    _search() {
        this._dataUnits = this._dataUnits.filter(unit =>
            this._searchFields.every(field => {
                return this._getRecordById(unit.recordId)[field.property.key]?.toUpperCase()?.includes(field.searchPhrase.toUpperCase()) ?? field.searchPhrase.length === 0;
            })
        )
    }

    _initializeProperties() {
        this._properties = this.apiClient.getMetaData().map(prop => new Property(prop.key, prop.key, prop.type, true, true, false));
    }

    async _fetch() {
        this._dataArray = await this.apiClient.getAllRecords();
    }

    _typeCastData() {
        this._properties.filter(prop => prop.type === "number").forEach(prop =>
            this._dataArray.forEach(record => record[prop.key] = parseInt(record[prop.key])))
    }

    _postFetch() {
        this._typeCastData();
        this._pipeline.postFetch.forEach(event => event());
        this._generateDataUnits();
    }

    _preRender() {
        this._pipeline.preRender.forEach(event => event());
    }

    _preMount() {
        this._pipeline.preMount.forEach(event => event());
    }

    _postMount() {
        this._pipeline.postMount.forEach(event => event());
    }

    _mountPostRender() {
        this._pipeline.mountPostRender.forEach(event => event());
        this._searchFields.forEach(field => field.postRender())
    }

    _postRender() {
        this._pipeline.postRender.forEach(event => event())
        this._dataUnits.forEach(unit => unit.postRender())
    }

    _render() {
        document.getElementById(this._dataViewName).innerHTML = this.html();
    }

    async mount(id) {
        this._preMount();
        this.el = document.querySelector(id);
        this._postMount();
        await this._fetch();
        this._postFetch();
        this._preRender();
        this.el.innerHTML = this.fullHtml();
        this._mountPostRender();
        this._postRender();
    }

    async _update(step, event) {

        const steps = [this._fetch.bind(this), this._postFetch.bind(this), this._preRender.bind(this), this._render.bind(this), this._postRender.bind(this)]

        await steps[step]();
        if (event) event();

        steps.slice(step + 1).forEach(async func => {
            await func();
        })

    }


    html() {
        return `${this._dialog ? this._dialog.html() : ""}
                ${this._searchFields.length > 0 ?
                `<div class="d-flex flex-row justify-content-start"> 
                ${this._searchFields.map(field => field.html).join('')} 
                </div>` : ""}`;
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

    get _el() {
        return document.getElementById(this._id);
    }
}


class DataUnit extends Component {

    _contentList;
    _recordId
    _record;
    _buttons = [];
    _events = ["showDialog", "send"]

    constructor(contentList, record, recordId, buttons) {
        super();
        this._contentList = contentList;
        this._recordId = recordId;
        this._record = record;
        this.buttons = buttons.map(button => new button.type(...button.params))
    }

    addCssClassToProperty(prop, cssClass){
        this._el.querySelector(`.${prop}`).classList.add(cssClass);
    }

    get recordId() {
        return this._recordId;
    }

    get record() {
        return this._record;
    }

    postRender() {
        this._events.forEach(event => {
            this._el.addEventListener(event, (e) => {
                e.detail.recordId = this._recordId
                e.detail.record = this._record
            })
        })

        this.buttons.forEach(btn => btn.postRender());
    }
}

class SearchField extends Component {

    _property;

    constructor(property) {
        super();
        this._property = property;
    }

    postRender() {
        this._el.addEventListener('keyup', this.onKeyUp.bind(this))
    }

    onKeyUp() {
        const event = new CustomEvent("search", {
            bubbles: true
        })

        this._el.dispatchEvent(event)
    }

    get property() {
        return this._property;
    }

    get searchPhrase() {
        return this._el?.value ?? "";
    }

    get html() {
        return `<input type="text" id=${this._id} placeholder="Search by ${this._property.name}"/>`
    }

}

class Button extends Component {

    _name;

    constructor(name) {
        super();
        this._name = name;
    }

    postRender() {
        this._el.addEventListener('click', () => this.onClick());
    }

    html() {
        return `<button id="${this._id}" type="button">${this._name}</button>`
    }

    blockHtml(){
        return `<button id="${this._id}" type="button" class="btn-block">${this._name}</button>`
    }

}

class DialogAcceptButton extends Button {

    _eventName;
    _record;
    _recordId;

    constructor(name, eventName, record, id) {
        super(name);
        this._eventName = eventName;
        this._record = record;
        this._recordId = id;
    }

    onClick() {
        const acceptEvent = new CustomEvent("accept",
            {
                bubbles: true,
                detail: {
                    event: this._eventName,
                    id: this._recordId
                }
            })

        this._el.dispatchEvent(acceptEvent);
    }
}

class DialogTriggerButton extends Button {

    _dialogType

    constructor(name, dialogType) {
        super(name);
        this._dialogType = dialogType;
    }

    onClick() {
        const event = new CustomEvent("showDialog",
            {
                bubbles: true,
                detail: {
                    dialogType: this._dialogType
                }
            });

        this._el.dispatchEvent(event);
    }
}


class ViewButton extends DialogTriggerButton {

    constructor() {
        super("View", ViewDialog)
    }
}

class EditButton extends DialogTriggerButton {

    constructor() {
        super("Edit", EditDialog)
    }
}


class DeleteButton extends DialogTriggerButton {

    constructor() {
        super("Delete", DeleteDialog)
    }
}

class SendButton extends Button {


    constructor() {
        super("Send");
    }

    onClick() {
        const event = new CustomEvent("send",
            {
                bubbles: true,
                detail: {}
            }
        );

        this._el.dispatchEvent(event);
    }

}

class Condition {

    static EqualTo(a, b) {
        return a === b;
    }

    static EqualOrLesserThan(a, b) {
        return a <= b;
    }

    static LesserThan(a, b) {
        return a < b;
    }

    static EqualOrGreaterThan(a, b) {
        return a >= b;
    }

    static GreaterThan(a, b) {
        return a > b;
    }

}

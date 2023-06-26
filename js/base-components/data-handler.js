import { RecordListComponent } from './component.js';
import * as clients from '../api-clients.js'


export class DataHandler extends RecordListComponent {

    _dataArray;
    _properties = [];
    _dataMappingPipeline = []
    _identifier;
    _apiClient

    _eventListeners = [
        { type: 'sendall', callback: this._sendAll.bind(this) },
        { type: 'validaterecords', callback: this._validateAndPreviewRecords },
        { type: 'getallrecords', callback: this._getRecords },
        { type: 'deleterecords', callback: this._deleteRecords },
        { type: 'deleterecord', callback: this._deleteRecord },
        { type: 'batchedit', callback: this._batchEdit },
        { type: 'edit', callback: this._editRecord },
        { type: 'addrecord', callback: this._addRecord },
        { type: 'getcolumns', callback: this._getColumns }
    ]

    _attributes = [
        { attribute: 'prop-names', type: 'json', callback: this._renameProperties.bind(this) },
        { attribute: 'prop-select', type: "json", callback: this._selectProperties.bind(this) },
        { attribute: 'prop-types', type: 'json', callback: this._setPropertyTypes.bind(this) },
        { attribute: 'prop-sum', type: 'json', callback: this._addSumProperty.bind(this) },
        { attribute: 'identifier', type: 'text', callback: this._addIdentifier.bind(this) },
        { attribute: 'prop-initials', type: 'json', callback: this._addInitialsColumn.bind(this) }
    ]

    constructor() {
        super();
        this._apiClient = clients.platformccApiClient();
        this._initializeProperties();
    }

    connectedCallback() {
        super.connectedCallback();
        this._update();
    }


    async _fetchAll() {
        return await this._apiClient.getAllRecords();
    }

    _createRecords(dataArray, key) {
        return dataArray.map(item => {
            const record = { attributes: [], id: item[this._identifier] };
            this.columns.forEach(prop => {
                const data = prop.type === 'number' ? parseInt(item[prop[key]]) : item[prop[key]]
                record.attributes.push({ "data": data, ...prop })
            })
            return record;
        })
    }

    _addSumProperty(options) {
        const columns = options[0], sumColumn = options[1];
        this._dataMappingPipeline.push(() => this._records.forEach(record => {
            this._getRecordAttribute(record, sumColumn).data = columns.map(column => this._getRecordAttribute(record, column).data).reduce((a, b) => a + b, 0)
        }))
        this._addProp(sumColumn, sumColumn, "number", true);
        return this;
    }

    _addInitialsColumn(options){
        const columns = options[0], initialsColumn = options[1];
        this._dataMappingPipeline.push(() => this._records.forEach(record => {
            this._getRecordAttribute(record, initialsColumn).data = columns.map(column => this._getRecordAttribute(record, column).data).reduce((a, b) => a.toUpperCase()[0] + b.toUpperCase()[0])
        }))
        this._addProp(initialsColumn, initialsColumn, "text", true);
        return this;    
      }


    _setPropertyTypes(properties) {
        properties[0].forEach(prop => this._getProp(prop).type = properties[1])
        return this;
    }

    _renameProperties(properties) {
        properties.forEach(prop => this._renameProperty(prop[0], prop[1]))
        return this;
    }

    _renameProperty(property, name) {
        this._changeProp(property, "name", name);
    }

    _selectProperties(properties) {
        this._properties.forEach(prop => prop.selected = properties.includes(prop.name));
        return this;
    }

    _initializeProperties() {
        this._properties = this._apiClient.getMetaData().map(prop => new Property(prop.key, prop.key, prop.type, false));
    }

    _addIdentifier(identifier) {
        this._identifier = identifier;
        this._changeProp(identifier, 'readonly', true);
    }

    _getProp(propName) {
        return this._properties.find(prop => prop.name === propName);
    }

    _getRecordAttribute(record, attribute) {
        return record.attributes.find(attr => attr.name === attribute)
    }

    _changeProp(property, type, newVal) {
        this._getProp(property)[type] = newVal;
    }

    _addProp(...params) {
        this._properties.push(new Property(...params));
    }

    _mapRecordToApiRecord(record) {
        const apiRecord = {};
        apiRecord[this._identifier] = record.id;
        record.attributes.forEach(attribute => {
            apiRecord[this._getProp(attribute.name).key] = attribute.data;
        })
        return apiRecord;
    }

    _mapRecordsToApiRecord(records) {
        return records.map(record => this._mapRecordToApiRecord(record));
    }

    async _validateAndPreviewRecords(e) {
        const dataArray = e.detail.records.map(record => {
            const updated = {};
            Object.keys(record).forEach(attribute => {
                if (this._properties.map(prop => prop.name).includes(attribute))
                    updated[attribute] = record[attribute];
            })
            return updated;
        })

        const records = this._createRecords(dataArray, "name");

        e.detail.callback({ "records": records, "columns": this.columns });

    }

    async _update() {
        this._dataArray = await this._fetchAll();
        this._records = this._createRecords(this._dataArray, "key");
        this._dataMappingPipeline.forEach(event => event());
        super._updateWatchers(this._records, this.columns)
    }

    get columns() {
        return [...this._properties.filter(prop => prop.selected)]
    }

    async _sendAll(e) {
        const records = this._mapRecordsToApiRecord(e.detail.records);
        await this._apiClient.createNewRecords(records);
        this._update();
    }

    async _deleteRecords(e) {
        await this._apiClient.deleteRecords(e.detail.records.map(record => record.id));
        this._update();
    }

    async _deleteRecord(e) {
        await this._apiClient.deleteRecord(e.detail.record.id);
        this._update();
    }

    async _batchEdit(e){
        await this._apiClient.editRecords(this._mapRecordsToApiRecord(e.detail.records));
        this._update();
    }

    async _editRecord(e){
        await this._apiClient.editRecord(this._mapRecordToApiRecord(e.detail.record));
        this._update();
    }

    async _addRecord(e){
        await this._apiClient.createNewRecord(this._mapRecordToApiRecord(e.detail.record));
        this._update();
    }

    _getRecords(e) {
        e.detail.callback({ "records": this._records, "columns": this.columns })
    }

    _getColumns(e) {
        e.detail.callback(this.columns);
    }


}

class Property {
    constructor(key, name, type, readonly) {
        this.key = key;
        this.name = name;
        this.type = type;
        this.readonly = readonly;
        this.selected = true
    }
}



customElements.define('data-handler', DataHandler);
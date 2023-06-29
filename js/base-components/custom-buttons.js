import { Component, RecordListComponent, SingleRecordComponent } from "./component.js";
import { Events } from "./events.js";


export class DialogAcceptButton extends RecordListComponent {

    _event;

    _attributes = [
        { attribute: 'event', type: 'text', callback: this._addEvent.bind(this) },
       
    ]

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("DOMContentLoaded", () => {
            this.addEventListener('click', () => {
                Events.send(this, this._event, {});
            })
        }, { once: true });
        super.render();
    }

    _addEvent(event){
        this._event = event;
    }

    get html() {
        return `<button type="button" class=${this._classes}>${this._name}</button>`
    }

}

customElements.define('dialog-accept-button', DialogAcceptButton);


export class CustomButton extends RecordListComponent {

    _target;

    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    _attributes = [
        { attribute: 'target', type: 'text', callback: this._addTarget.bind(this) },
        { attribute: 'index', type: 'text', callback: this._setIndex.bind(this)}
    ]


    connectedCallback() {
        super.connectedCallback();
        super.render();
        this.style.visibility = 'hidden';
    }

    _setIndex(index){
        this._index = index;
    }

    _addTarget(target) {
        this._target = document.getElementById(target);
    }

    _onClick() {
        super._updateWatchers(this._records, this._columns);
        if(this._target) this._target.update(this._records, this._columns)
    }

    update(records, columns) {
         this.style.visibility = records.length > 0 ? 'visible' : 'hidden';
        super.update(records, columns);
        super.render();
    }

    get html() {
        return `<button type="button" class="${this._classes}">${this._name}</button>`
    }

}

customElements.define('custom-button', CustomButton);

export class TableButton extends SingleRecordComponent {

    _target;
    _index;

    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    _attributes = [
        { attribute: 'target', type: 'text', callback: this._addTarget.bind(this) },
        { attribute: 'index', type: 'text', callback: this._setIndex.bind(this)}
    ]


    async connectedCallback() {
        super.connectedCallback();
        this._record = await Events.getAsync(this, 'getrecord');
        super.render();
    }

    _setIndex(index){
        this._index = index;
    }

    _addTarget(target) {
        this._target = document.getElementById(target);
    }

    _onClick() {
        if(this._target) this._target.update([this._record])
    }

    get index(){
        return this._index;
    }

    update(records) {
        super.update(records);
        super.render();
    }

    get html() {
        return `<button type="button" class="${this._classes}">${this._name}</button>`
    }

}

customElements.define('table-button', TableButton);

export class SelectAllButton extends Component {

    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    _attributes = [
        { attribute: 'target', type: 'text', callback: this._addTarget.bind(this) }
    ]

    connectedCallback(){
        super.connectedCallback();
        super.render();
    }

    _addTarget(target){
        this._target = document.getElementById(target);
    }


    _onClick(e){
        this._target.selectAllRecords();
    }


    get html() {
        return `<button type="button" class="${this._classes}">${this._name}</button>`
    }

}

customElements.define('select-all-button', SelectAllButton);
export class ExportRecordsButton extends RecordListComponent {

    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    connectedCallback() {
        super.connectedCallback();
        super.render();
        this.style.visibility = 'hidden';
    }

    _onClick() {
        const csv = this._getCsvContent(this._records, this._columns);
        const blob = new Blob([csv], { type: 'text/csv' });
        this.querySelector('a').href = URL.createObjectURL(blob);
    }

    update(records, columns) {
        this.style.visibility = records.length > 0 ? 'visible' : 'hidden';
       super.update(records, columns);
       super.render();
   }

    _getCsvContent(records, columns) {
        return columns.map(column => column.name)
            .join(';')
            .concat("\n")
            .concat(records.map(record => {
                return record.attributes.map(attribute => attribute.data).join(';')
            }).join('\n'))
    }

    get html() {
        return `
        <a class="${this._classes}" download="records.csv">
          <button type="button">Download records</button>
        </a>
      `;
    }
}

customElements.define('export-records-button', ExportRecordsButton);
export class ImportRecordsButton extends RecordListComponent {

    _columns;
    _rows;

    _eventListeners = [
        { type: 'change', callback: this._onChange.bind(this) }
    ]


    connectedCallback() {
        super.connectedCallback();
        super.render();
    }

    _splitCsvIntoLines(csvContent) {
        return csvContent.split(/\r?\n/).filter((line) => {
            return line.trim() !== '';
        });;
    }

    _getCsvColumns(lines) {
        return lines[0].split(';');
    }


    _getCsvRecord(columns, line) {
        const record = {};
        line.split(';').forEach((value, index) => {
            record[columns[index]] = value;
        })
        return record;
    }

    _getCsvRecords(columns, lines) {
        return lines.splice(1).map(line => this._getCsvRecord(columns, line));
    }

    async _update(csvContent) {
        const lines = this._splitCsvIntoLines(csvContent);
        const columns = this._getCsvColumns(lines);
        const csvRecords = this._getCsvRecords(columns, lines);
        const data = await Events.validateAllAsync(this, csvRecords);
        super._updateWatchers(data.records, data.columns);

    }

    _onChange(e) {

        const file = e.target.files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = async (e) => {
                this._update(e.target.result);
            };
            reader.readAsText(file);
        }
    }

    get html() {
        return `<input class="${this._classes}" type="file"/>`
    }

}


customElements.define('import-records-button', ImportRecordsButton);


import { Component  } from "./component.js";
import { Events } from "./events.js";

export class AddRecordsButton extends HTMLElement {

    _name;

    connectedCallback() {
        document.addEventListener("DOMContentLoaded", () => {
            this.addEventListener('click', () => {
                Events.sendAll(this, {});
            })
        }, { once: true });

        this._name = this.getAttribute("name");
        this.innerHTML = this.html;
    }


    get html() {
        return `<button type="button">${this._name}</button>`
    }

}

customElements.define('add-records-button', AddRecordsButton);

export class CustomButton extends Component {

    _name;

    _eventListeners = [
        { type: 'click', callback: this._onClick }
    ]

    _initializers = [
        { attribute: 'name', type: 'text', callback: this._setName.bind(this) }
    ]

    connectedCallback() {
        super.connectedCallback();
        this.style.visibility = 'hidden';
    }

    _onClick() {
        super._updateWatchers(this._records, this._columns);
    }

    update(records, columns) {
        this.style.visibility = records.length > 0 ? 'visible' : 'hidden';
        super.update(records, columns);
        super.render();
    } 

    _setName(name) {
        this._name = name;
    }

    get html() {
        return `<button type="button">${this._name}</button>`
    }

}

customElements.define('custom-button', CustomButton);


export class ExportRecordsButton extends HTMLElement {


    connectedCallback() {
        this.addEventListener('click', async () => {
            const { records, columns } = await getAllAsync(this, "getallrecords");
            const csv = this._getCsvContent(records, columns);
            const blob = new Blob([csv], { type: 'text/csv' });
            this.querySelector('a').href = URL.createObjectURL(blob);
        })

        this.innerHTML = this.html;
    }

    _getCsvContent(records, columns) {
        return columns.map(column => column.name)
            .join(';')
            .concat("\n")
            .concat(records.map(record => {
                return record.map(attribute => attribute.data).join(';')
            }).join('\n'))
    }

    get html() {
        return `
        <a download="records.csv">
          <button type="button">Download records</button>
        </a>
      `;
    }
}



customElements.define('export-records-button', ExportRecordsButton);
export class ImportRecordsButton extends HTMLElement {

    _columns;
    _rows;
    _watchers = [];


    connectedCallback() {
        this.innerHTML = this.html;
        this.addEventListener('change', this.onChange.bind(this))
    }

    register(watcher) {
        this._watchers.push(watcher);
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

    onChange(e) {

        var file = e.target.files[0];

        let csvContent;

        if (file) {
            var reader = new FileReader();
            const self = this;

            reader.onload = async (e) => {
                csvContent = e.target.result;
                const lines = this._splitCsvIntoLines(csvContent);
                const columns = this._getCsvColumns(lines);
                const csvRecords = this._getCsvRecords(columns, lines);
                const data = await Events.validateAllAsync(this, csvRecords);
                this._watchers.forEach(watcher => watcher.update(data.records, data.columns))
            };

            reader.readAsText(file);
        }
    }

    get html() {
        return `<input type="file"/>`
    }

}


customElements.define('import-records-button', ImportRecordsButton);


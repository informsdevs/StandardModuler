import { RecordListComponent } from "./component.js";

export class CustomGrid extends RecordListComponent {

    _attributes = [
        { attribute: 'row-count', type: 'text', callback: this._setRowCount.bind(this) }    ]

    _eventListeners = [
        { type: 'getrecord', callback: this._getRecord }
    ]

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("DOMContentLoaded", () => {
            this._retrieveGridColumnContainer();
            this._retrieveGridColumns();
        });
    }

    _setRowCount(rowCount) {
        this._rowCount = rowCount;
    }

    _getRecord(e) {
        e.detail.callback(this._records[e.target.index])
    }

    _retrieveGridColumnContainer() {
        this._gridColumnContainer = this.querySelector('grid-columns');
    }

    _retrieveGridColumns() {
        this._gridColumns = [...this._gridColumnContainer.children];
    }

    _retrieveGridCells() {
        this._gridCells = [...this.querySelectorAll(".custom-grid-cell")]
    }

    _renderCustomColumns() {
        this._gridCells.forEach((cell, index) => {
            this._gridColumns.forEach(column => {
                let clonedColumn = column.cloneNode(true);
                clonedColumn.setAttribute('index', index);
                let div = document.createElement('div');
                div.appendChild(clonedColumn);
                cell.appendChild(div)
            })
        })
    }

    update(records, columns) {
        super.update(records, columns);
        super.render();
        this._retrieveGridCells();
        this._renderCustomColumns();
    }


    _getCellHtml(record) {
        return `<div class="custom-grid-cell col-4">
        ${this._getRecordAttributes(record).map(attribute => `<div class="text-center">${attribute.data ?? ""}</div>`).join('')}
        </div>`

    }

    get html() {
        return `<div class="${this._classes}">
        ${this._records.map((record, i) => {
            if (i % this._rowCount === 0) {
                return `<div class="row">${this._getCellHtml(record)}`;
            }
            if ((i + 1) % this._rowCount === 0) {
                return `${this._getCellHtml(record)}</div>`;
            }
            return this._getCellHtml(record);
        }).join('')}
      </div>`;
    }
}

customElements.define('custom-grid', CustomGrid);

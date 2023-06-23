import { RecordListComponent } from "./component.js"

export class CustomTable extends RecordListComponent {

  _selectedRecordIndices = []
  _tableRows = [];
  _tableColumns = [];
  _tableColumnContainer;

  _features = {
    select: false
  }

  _eventListeners = [
    { type: 'select', callback: this._selectRecord },
    { type: 'getrecord', callback: this._getRecord }
  ]

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("DOMContentLoaded", () => {
        this._retrieveTableColumnContainer();
        this._retrieveTableColumns(); 
    });
  }

  _getRecord(e){
    e.detail.callback(this._records[e.target.index])
}

  _retrieveTableColumnContainer() {
    this._tableColumnContainer = this.querySelector('table-columns');
  }

  _retrieveTableColumns() {
    this._tableColumns = [...this._tableColumnContainer.children];
  }

  _retrieveTableRows() {
    this._tableRows = [...this.querySelectorAll(".custom-table-row")]
  }

  _renderCustomColumns() {
    this._tableRows.forEach((row, index) => {
      this._tableColumns.forEach(column => {
        let clonedColumn = column.cloneNode(true);
        clonedColumn.setAttribute('index', index);
        let td = document.createElement('td');
        td.appendChild(clonedColumn);
        row.appendChild(td)
      })
    })
  }


  _selectRecord(e) {
    e.target.selected ? this._selectedRecordIndices.push([e.target.index]) : this._selectedRecordIndices.splice(this._selectedRecordIndices.indexOf(e.target.index), 1)
    this._updateWatchers(this._selectedRecordIndices.map(index => this._records[index]), this._columns)
  }

  update(records, columns) {
    this._selectedRecordIndices = [];
    super.update(records, columns);
    super.render();
    this._retrieveTableRows();
    this._renderCustomColumns();
  }


  get html() {
    return `
          <table id="${this._dataViewName}" class="table">
            <thead>
              <tr>
                ${this._features.select ? `<th scope='col'>Select</th>` : ''}
                ${this._columns.map(column => `<th class="column" scope="col">${column.name}</th>`).join('')}
                ${this._tableColumns.length > 0 ? `<th scope='col' colspan="${this._tableColumns.length}">${this._tableColumnContainer.name}</th>` : ""} 
              </tr>
            </thead>
            <tbody>
              ${this._records
        .map((record, index) => {
          return `
                    <tr class='custom-table-row' id=${index}>
                      ${this._features.select ? `<td><custom-check-box index=${index}></td>` : ''}
                      ${record.attributes.map(attribute => `<td>${attribute.data}</td>`).join('')}
                     
                    </tr>
                  `;
        })
        .join('')}
            </tbody>
          </table>
        `;
  }

}


customElements.define('custom-table', CustomTable);

export class TableColumns extends HTMLElement {

  _name

  connectedCallback() {
    this._name = this.getAttribute('name');
  }

  get name() {
    return this._name;
  }

}

customElements.define('table-columns', TableColumns);


import { RecordListComponent, Component } from "./component.js"
import { Events } from "./events.js";
import { MathConditions } from "../misc/math-conditions.js";

export class CustomTable extends RecordListComponent {

  _selectedRecords = new Set();
  _tableRows = [];
  _tableColumns = [];
  _postRender = [];
  _tableColumnContainer;
  _cellWrapper;

  _features = {
    select: false,
    clicksort: false
  }

  _eventListeners = [
    { type: 'select', callback: this._selectRecord },
    { type: 'getrecord', callback: this._getRecord }
  ]

  _attributes = [
    { attribute: 'wrap-cells', type: 'text', callback: this._addCellWrapper.bind(this) },
    { attribute: 'column-select', type: 'json', callback: this._selectColumns.bind(this) },
    { attribute: 'conditional-class', type: 'json', callback: this._addConditionalClass.bind(this) }
  ]

  connectedCallback() {
    super.connectedCallback();
    Events.invoke(this, 'register');
    document.addEventListener("DOMContentLoaded", () => {
      this._retrieveTableColumnContainer();
      this._retrieveTableColumns();
    });
  }

  defineColumns(columns) {
    this._selectColumns(columns);
    super.render();
    this._retrieveTableRows();
    this._renderCustomColumns();
  }

  selectAllRecords() {
    this._selectedRecords = new Set(this._records.map(record => record.id));
    this.querySelectorAll('custom-check-box').forEach(checkbox => checkbox.check());
    this._updateWatchers(this._records, this._columns);
  }

  selectNoRecords() {
    this._selectedRecords = new Set();
    this.querySelectorAll('custom-check-box').forEach(checkbox => checkbox.uncheck())
    this._updateWatchers([], this._columns)
  }

  _addConditionalClass(options) {
    const column = options[0], condition = options[1], value = options[2], classes = options[3];
    this._postRender.push(() =>
      this._records.filter(record => {
        const attribute = record.attributes.find(attr => attr.name === column)
        return MathConditions[condition](attribute.data, value);
      }).forEach(record => {
        this.querySelector(`[data-recordid = "${record.id}"] [data-attribute = "${column}"]`).classList.add(classes);
      }))
  }


  _addCellWrapper(wrapper) {
    this._cellWrapper = wrapper;
  }

  _getRecord(e) {
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

  _updateSelectedRecords(){
    const test = this._records.filter(record => this._selectedRecords.has(record.id));
    this._records.filter(record => this._selectedRecords.has(record.id))
    .forEach(record => this.querySelector(`custom-check-box[data-recordid = "${record.id}"]`).check())
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
    e.target.selected ? this._selectedRecords.add(parseInt(e.target.dataset.recordid)) : this._selectedRecords.delete(parseInt(e.target.dataset.recordid));
    this._updateWatchers([...this._selectedRecords].map(id => this._records.find(record => id === record.id)), this._columns)
  }

  update(records, columns) {
    super.update(records, columns);
    super.render();
    this._selectedRecords = new Set();
    this._updateWatchers([], columns);
    this._postRender.forEach(effect => effect());
    this._retrieveTableRows();
    this._renderCustomColumns();
  }


  get html() {
    return `
          <table id="${this._dataViewName}" class="table ${this._classes}">
            <thead>
              <tr>
                ${this._features.select ? `<th scope='col'>Select</th>` : ''}
                ${this.columns.map(column => `<th class="column " scope="col">${column.name}</th>`).join('')}
                ${this._tableColumns.length > 0 ? `<th scope='col' colspan="${this._tableColumns.length}">${this._tableColumnContainer.name}</th>` : ""} 
              </tr>
            </thead>
            <tbody>
              ${this._records
        .map((record, index) => {
          return `
                    <tr class='custom-table-row' id=${index} data-recordid="${record.id}">
                      ${this._features.select ? `<td><custom-check-box data-recordid="${record.id}"></td>` : ''}
                      ${this._getRecordAttributes(record).map(attribute => `<td data-attribute="${attribute.name}">${this._cellWrapper ? `<${this._cellWrapper}>${attribute.data}</${this._cellWrapper}>` : `${attribute.data}`}</td>`).join('')}
                     
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

export class RowCount extends RecordListComponent {


  update(records) {
    super.update(records);
    super.render();
  }


  get html() {
    return `<p>${this._records.length} row(s) selected</p>`
  }
}

customElements.define('row-count', RowCount);


export class SelectAllRecords extends Component {

  _eventListeners = [
    { type: 'click', callback: this._onClick }
  ]

  _attributes = [
    { attribute: 'target', type: 'text', callback: this._addTarget.bind(this) }
  ]

  connectedCallback() {
    super.connectedCallback();
    super.render();
  }

  _addTarget(target) {
    this._target = document.getElementById(target);
  }


  _onClick(e) {
    this._target.selectAllRecords();
  }


}

export class ClearAllRecords extends Component {

  _eventListeners = [
    { type: 'click', callback: this._onClick }
  ]

  _attributes = [
    { attribute: 'target', type: 'text', callback: this._addTarget.bind(this) }
  ]

  connectedCallback() {
    super.connectedCallback();
    super.render();
  }

  _addTarget(target) {
    this._target = document.getElementById(target);
  }


  _onClick(e) {
    this._target.selectNoRecords();
  }


}

export class SelectAllRecordsButton extends SelectAllRecords {
  get html() {
    return `<button type="button" class="${this._classes}">${this._name}</button>`
  }
}

customElements.define('select-all-records-button', SelectAllRecordsButton);

export class ClearAllRecordsButton extends ClearAllRecords {
  get html() {
    return `<button type="button" class="${this._classes}">${this._name}</button>`
  }
}

customElements.define('clear-all-records-button', ClearAllRecordsButton);

export class SelectAllRecordsCheckbox extends SelectAllRecords {

  get html() {
    return `<input type='checkbox' style="cursor:pointer"/>
    <label for="${this._name}">
    ${this._name}
  </label>`
  }

  _onClick(e) {
    this.querySelector('input').checked ? this._target.selectAllRecords() : this._target.selectNoRecords();;

  }
}

customElements.define('select-all-records-checkbox', SelectAllRecordsCheckbox);



export class ColumnSum extends RecordListComponent {

  _column;

  _attributes = [
    { attribute: 'column', type: 'text', callback: this._addColumn.bind(this) }
  ]

  _addColumn(column) {
    this._column = column;
  }

  update(records) {
    super.update(records);
    super.render();
  }

  get sum() {
    return this._records.map(record => record.attributes.find(attribute => attribute.name === this._column).data).reduce((a, b) => a + b)
  }

  get html() {
    return `<p>${this.sum}</p>`;
  }

}

customElements.define('column-sum', ColumnSum);

export class ColumnAverage extends ColumnSum {


  get average() {
    return super.sum / this._records.length;
  }

  get html() {
    return `<p>${this.average}</p>`;
  }

}

customElements.define('column-average', ColumnAverage);


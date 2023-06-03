class Table extends DataView {

  _columns = [];
  _selectedRecords = [];
  _tableButtons = [];
  _includeNumberedRows = false;
  _includeClickSort = false;
  _sortedInDescendingOrder = true;
  _includeTableButtons = false;

  constructor(apiClient) {
    super(apiClient, { "DataUnit": Row, "Property": Column })
  }

  _preMount() {
    super._preMount();
    this._generateColumns();
    this.dataUnitParams = [this._includeNumberedRows, this._includeTableButtons]
  }

  _postMount() {
    super._postMount();
    this.el.addEventListener('sort', (e) => this._sortColumns(e.column))
  }

  _postRender() {
    super._postRender();
    this._columns.forEach(column => column.postRender());
    this._selectedRecords = [];
  }

  _selectRecord(record, selected) {
    selected ? this._selectedRecords.push(record) : this._selectedRecords.splice(this._selectedRecords.indexOf(record), 1)
    console.log(this._selectedRecords.length);
  }

  _sortColumns(column) {
    this._sortedInDescendingOrder = !this._sortedInDescendingOrder;
    this._update(2, () => this._sort(column, this._sortedInDescendingOrder));
  }

  _generateColumns() {
    this._columns = this._getMainViewProperties().map(prop => new Column(prop, this._includeClickSort))
  }

  _generateRows() {
    this._rows = this._dataUnits.map(dataUnit => new Row(dataUnit, this._includeNumberedRows, this._includeTableButtons))
  }

  addNumberedRows() {
    this._includeNumberedRows = true;
    return this;
  }

  addTableButtons() {
    this._initializeDialog();
    this._tableButtons.push(new TableButton("Add"), new TableButton("Delete", "Batch Delete"), new TableButton("Edit"), new TableButton("Send"));
    this._includeTableButtons = true;
    this._pipeline.mountPostRender.push(
      () => this._tableButtons.forEach(button => button.postRender()),
      () => this.el.addEventListener('check', (e) => this._selectRecord(e.detail.row, e.detail.selected)));

    return this;
  }

  async acceptDialog(details){
      if(details.event === "batchdDelete") await this.apiClient.deleteRecords(details.id);
      super.acceptDialog(details);
  }

  _showDialog(type) {
    console.log(this._selectedRecords.length)
    if (type === "Batch Delete") {
      super._showDialog(new BatchDeleteDialog(this._selectedRecords.map(row => row.dialogRecord), this._selectedRecords.map(row => row.recordId), this._selectedRecords.map(row => row.recordInfoLabel)))
    } else {

    super._showDialog(type);
    }
  }

  addClickSort() {
    this._includeClickSort = true;
    return this;
  }

  fullHtml() {
    return super.html().concat(`
    ${this._tableButtons.length > 0 ? `
      <div class="d-flex flex-row justify-content-end">
        ${this._tableButtons.map(button => button.html()).join('')} 
      </div>` : ""}`
    ).concat(this.html());
  }


  html() {
    return `
      <table id="${this._dataViewName}" class="table">
        <thead>
          <tr>
            ${this._tableButtons.length > 0 ? `<th scope='col'>Select</th>` : ''}
            ${this._includeNumberedRows ? "<th scope='col'>#</th>" : ""}
            ${this._columns.map(column => column.html()).join('')}
            ${this._unitButtons.length > 0 ? `<th scope='col' colspan="${this._unitButtons.length}">Actions</th>` : ""} 
          </tr>
        </thead>
        <tbody>
          ${this._dataUnits.map((row, index) => {
      row.index = index;
      return row.html()
    }).join('')}
        </tbody>
      </table>
    `;
  }

}

class Column extends Component {

  constructor({ key, name, type, readonly }, includeClickSort) {
    super();
    this.key = key;
    this.name = name;
    this.type = type;
    this.readonly = readonly;
    this.includeClickSort = includeClickSort;
  }

  postRender() {
    if (this.includeClickSort) {
      this._el.addEventListener('click', this.onClick.bind(this))
      this._el.style.cursor = "pointer";
    }
  }

  onClick() {
    const sortEvent = new Event('sort', { bubbles: true });
    sortEvent.column = this.name;
    this._el.dispatchEvent(sortEvent);
  }

  html() {
    return `<th class="column" scope="col" id="${this._id}" }>${this.name}</th>`
  }
}

class Row extends DataUnit {

  _includeNumberedRows;
  _checkBox;


  constructor(contentList, dialogRecord, recordId, index, recordInfoLabel, buttons, record, includeNumberedRows, includeCheckBox) {
    super(contentList, dialogRecord, recordId, index, recordInfoLabel, buttons, record)
    this._includeNumberedRows = includeNumberedRows;
    if (includeCheckBox) this._checkBox = new CheckBox();
  }

  postRender() {
    super.postRender();
    if (this._checkBox) {
      this._checkBox.postRender();
      this._el.addEventListener('check', (e) => e.detail.row = this)
    }
  }

  html() {
    return `<tr id="${this._id}">
    ${this._checkBox ? `<th> ${this._checkBox.html}</th>` : ""}
     ${this._includeNumberedRows ? `<th scope='row'>${this.index + 1}</th>` : ""}
     ${this.contentList.map(content => `<td>${content ?? ""}</td>`).join('')}
     ${this.buttons.map(button => `<td>${button.html()}</td>`).join('')}
     </tr>`
  }

}



class TableButton extends Button {


  _type

  constructor(name, type) {
    super(name);
    this._type = type;
  }

  onClick() {
    const event = new CustomEvent('showDialog', {
      bubbles: true,
      detail: this._type
    })

    this._el.dispatchEvent(event);
  }
}


class CheckBox extends Component {


  postRender() {
    this._el.addEventListener('click', this.onClick.bind(this))
  }

  onClick() {
    const event = new CustomEvent('check', {
      bubbles: true,
      detail: {
        selected: this._el.checked
      }
    });

    this._el.dispatchEvent(event);
  }


  get html() {
    return `<input type='checkbox' id="${this._id}" style="cursor:pointer"/>`
  }

}





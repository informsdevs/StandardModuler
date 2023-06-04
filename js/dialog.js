class Dialog extends Component {

    _modal;
    _table;
    _acceptButton;
    _dialog
    _body = uuid.v4();
    _title = uuid.v4();
    _accept = uuid.v4();

    show() {
        this._modal.show();
    }

    update(dialog) {
        this._dialog = dialog;
        this._table = dialog.table;
        this._acceptButton = dialog.accept;
        document.getElementById(this._title).innerText = dialog.title;
        document.getElementById(this._body).innerHTML = dialog.html;
        document.getElementById(this._accept).innerHTML = this._acceptButton.html();
    }

    onAccept(e) {
        if (this._table && !this._table.readonly)
            e.detail.record = this._table.input;
        this._modal.hide()
    }

    postRender() {
        this._el.addEventListener("accept", this.onAccept.bind(this))
        this._table?.postRender();
        this._acceptButton?.postRender();
        this._modal = new bootstrap.Modal(this._el);
    }

    html() {
        return `
        <div class='modal fade' id="${this._id}" tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="${this._title}"></h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body" id="${this._body}">
              </div>
              <div class="modal-footer" id="${this._accept}">
              </div>
            </div>
          </div>
        </div>
      `;
    }
}
class EditDialog {

    _record
    _table
    _id


    constructor(record, id) {
        this._record = record;
        this._id = id;
        this._table = new DialogTable(this._record, true, false, false);
    }

    get title() {
        return "Edit record"
    }

    get accept() {
        return new DialogAcceptButton("Save", "edit", this._record, this._id)
    }

    get id() {
        return this._id;
    }

    get table() {
        return this._table;
    }

    get html() {
        return this._table.html
    }


}

class ViewDialog {

    _record
    _table;

    constructor(record) {
        this._record = record;
        this._table = new DialogTable(record, true, true, false);
    }

    get title() {
        return "View record"
    }

    get table() {
        return this._table;
    }

    get accept() {
        return new DialogAcceptButton("Ok")
    }

    get html() {
        return this._table.html;
    }


}

class DeleteDialog {

    _record
    _id
    _label

    constructor(record, id, label) {
        this._record = record;
        this._id = id;
        this._label = label;
    }

    get title() {
        return "Delete record"
    }

    get accept() {
        return new DialogAcceptButton("Confirm", "delete", this._record, this._id)
    }


    get html() {
        return `Are you sure you want to delete ${this._label}?`
    }

}

class AddRecordDialog {

    _record
    _table
    _id


    constructor(record, id) {
        this._record = record;
        this._id = id;
        this._table = new DialogTable(this._record, true, false, false);
    }

    get title() {
        return "Add record"
    }

    get accept() {
        return new DialogAcceptButton("Save", "add", this._record, this._id)
    }

    get id() {
        return this._id;
    }

    get table() {
        return this._table;
    }

    get html() {
        return this._table.html
    }


}


class BatchDeleteDialog {

    _records
    _ids
    _labels

    constructor(records, ids, labels) {
        this._records = records;
        this._ids = ids;
        this._labels = labels;
    }

    get title() {
        return "Delete records"
    }

    get accept() {
        return new DialogAcceptButton("Confirm", "batchdDelete", this._records, this._ids)
    }

    get html(){
        const lastLabel = this._labels.pop();
        return `Are you sure you want to delete ${this._labels.join(', ')} and ${lastLabel}?` 
    }


}


class BatchEditDialog {

    _records
    _ids
    _labels
    _table

    constructor(records, ids, labels) {
        this._records = records;
        this._ids = ids;
        this._labels = labels;
        this._table = new DialogTable(this._records[0], false, false, true);
    }

    get title() {
        return "Edit records"
    }

    
    get accept() {
        return new DialogAcceptButton("Save", "batchEdit", this._records, this._ids)
    }

    get table() {
        return this._table;
    }

    get html() {
        return this._table.html
    }

}

class InputField extends Component {

    _data;
    _readonly;
    _type;
    _name;
    _fillOut;

    constructor(name, data, type, readonly, fillOut) {
        super();
        this._readonly = readonly;
        this._type = type;
        this._name = name;
        this._fillOut = fillOut
        this._data = data;
    }

    disable(){
        this._el.disabled = true;
    }

    enable(){
        this._el.disabled = false;
    }

    get disabled(){
        return this._el.disabled;
    }

    get input() {
        return this._el.value;
    }

    get html() {
        return `<input type="${this._type}" id="${this._id}" ${this._readonly ? "disabled" : ""} value="${this._fillOut ? `${this._data}` : ""}"/>`
    }
}

class DialogRow extends Component{

    _attr
    _fillOut
    _readonly
    _checkBox
    _inputField

    constructor(attr, fillOut, readonly, includeCheck) {
        super();
        this._readonly = readonly;
        this._attr = attr;
        if (!readonly && !includeCheck)
            this._inputField = new InputField(attr.name, attr.data, attr.type, attr.readonly, fillOut)
        if (includeCheck){
            this._inputField = new InputField(attr.name, attr.data, attr.type, true, fillOut)
            this._checkBox = new CheckBox();
        }
    }

    postRender() {
        this._el.addEventListener('check', this.onCheck.bind(this))
        this._checkBox?.postRender();
    }

    onCheck(e){
        e.stopPropagation();
        e.detail.selected ? this._inputField.enable() : this._inputField.disable();
    }

    get disabled(){
        return this._inputField.disabled;
    }

    get input() {
        return this._inputField.input;
    }

    get name() {
        return this._attr.name;
    }

    get html() {
        return `<tr id="${this._id}"> ${this._checkBox ? `<td>${!this._attr.readonly ? `${this._checkBox.html}` : ""}</td>` : ""}
        ${this._readonly ?
            `<td>${this._attr.name}</td><td>${this._attr.data}</td></tr>` :
            `<td>${this._attr.name}</td><td>${this._inputField.html}</td></tr>`}`
    }

}

class DialogTable {

    _rows;
    _readonly

    constructor(record, fillOut, readonly, includeCheck) {
        this._readonly = readonly;
        this._rows = record.map(attr => new DialogRow(attr, fillOut, readonly, includeCheck))
    }

    postRender() {
        this._rows.forEach(row => row.postRender());
    }

    get input() {
        const record = {};
        this._rows.forEach(row => {
            if(!row.disabled) record[row.name] = row.input
        })
        return record;
    }

    get readonly(){
        return this._readonly
    }

    get html() {
        return `
          <table class="table">
            <tbody>
                ${this._rows ? this._rows.map(row => row.html).join('') : ""}
            </tbody>
          </table>
        `;
    }
}



import { RecordListComponent, SingleRecordComponent } from "./component.js";
import { Events } from "./events.js";

export class CustomDialog extends RecordListComponent {

    _modal;
    _titleContent;
    _bodyContent;
    _footerContent;
    _body;
   

    _eventListeners = [
        { type: 'sendall', callback: this._updateEventRecords },
        { type: 'deleterecords', callback: this._updateEventRecords },
        { type: 'deleterecord', callback: this._updateEventRecord },
        { type: 'batchedit', callback: this._batchEdit },
        { type: 'edit', callback: this._edit },
        { type: 'addrecord', callback: this._addRecord },
        { type: 'register', callback: this._registerChild }
    ]

 
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("DOMContentLoaded", () => {
             this._retrieveInnerHtml();
             super.render();
             this._applyElements();
             this._modal = new bootstrap.Modal(this.querySelector('.modal'));
        });
    }

    _updateEventRecords(e) {
        e.detail.records = this._records;
        this._modal.hide();
    }

    _updateEventRecord(e){
        e.detail.record = this._records[0];
        this._modal.hide();
    }

    _batchEdit(e){
        this._records.forEach(record => record.attributes = this._body.userInput);
        e.detail.records = this._records;
        this._modal.hide();
    }

    _edit(e){
        const record = this._records[0];
        record.attributes = this._body.userInput;
        e.detail.record = record;
        this._modal.hide();
    }

    _addRecord(e){
        e.detail.record = {attributes : this._body.userInput};
        this._modal.hide();
    }

    _registerChild(e){
        this._body = e.target;
    }
  
    _retrieveInnerHtml(){
        this._titleContent = this.querySelector('dialog-title');
        this._bodyContent = this.querySelector('dialog-body');
        this._footerContent = this.querySelector('dialog-footer');
    }

    _applyElements() {
        this.querySelector(".modal-title").appendChild(this._titleContent);
        this.querySelector(".modal-body").appendChild(this._bodyContent);
        this.querySelector(".modal-footer").appendChild(this._footerContent);
    }

    update(records) {
        super.update(records);
        this._body instanceof SingleRecordComponent ? this._body.update(records[0]) : this._body.update(records)
        this._modal.show();
    }



    get html() {
        return `
        <div class='modal fade custom-modal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"></h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body"></div>
              <div class="modal-footer"></div>
            </div>
          </div>
        </div>
      `;
    }
}

customElements.define('custom-dialog', CustomDialog);


export class DialogDeleteBody extends SingleRecordComponent {

    _infoAttribute;

    _attributes = [
        { attribute: 'info', type: 'text', callback: this._setInfo.bind(this) }      
    ]

    connectedCallback(){
        super.connectedCallback();
        Events.invoke(this, 'register');
      }
    

    _setInfo(info) {
        this._infoAttribute = info;
    }

    update(record) {
        super.update(record);
        super.render();
    }

    get infoStr() {
        if (!this._infoAttribute) return 'this record';
        return this._record.attributes.find(attr => attr.name === this._infoAttribute).data;
    }

    get html() {
        return `<p>Are you sure you want to delete ${this.infoStr}?</p>`
    }
}

customElements.define('dialog-delete-body', DialogDeleteBody);

export class DialogBatchDeleteBody extends RecordListComponent {

    _infoAttribute;

    _attributes = [
        { attribute: 'info', type: 'text', callback: this._setInfo.bind(this) }      
    ]

    connectedCallback(){
        super.connectedCallback();
        Events.invoke(this, 'register');
      }

    _setInfo(info) {
        this._infoAttribute = info;
    }

    update(records, columns) {
        super.update(records, columns);
        super.render();
    }

    get infoStr() {
        if (!this._infoAttribute) return 'these records';
        if (this._records.length === 1) return this._records[0].attributes.find(attr => attr.name === this._infoAttribute).data;
        const tokens = this._records.map(record => record.attributes.find(attr => attr.name === this._infoAttribute).data);
        const lastToken = tokens.pop();
        return `${tokens.join(', ')} and ${lastToken}`
    }

    get html() {
        return `<p>Are you sure you want to delete ${this.infoStr}?</p>`
    }
}

customElements.define('dialog-batch-delete-body', DialogBatchDeleteBody);

export class DialogTitle extends HTMLElement {

}

customElements.define('dialog-title', DialogTitle);

export class DialogBody extends HTMLElement {

 }

customElements.define('dialog-body', DialogBody);


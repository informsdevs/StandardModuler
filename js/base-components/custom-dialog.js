import { Component } from "./component.js";

export class CustomDialog extends Component {

    _modal;
    _titleContent;
    _bodyContent;
    _footerContent;
    _title;
    _body;
    _footer;
    _records;

    _eventListeners = [
        { type: 'sendall', callback: this._sendAll }]

    _initializers = [
       
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

    _sendAll(e) {
        e.detail.records = this._records;
        this._modal.hide();
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


export class DialogDeleteBody extends Component {

    _infoAttribute;

    _initializers = [
        { attribute: 'info', type: 'text', callback: this._setInfo.bind(this) }
    ]

    _setInfo(info) {
        this._infoAttribute = info;
    }

    update(records, columns) {
        super.update(records, columns);
        super.render();
    }

    get infoStr() {
        if (this._records.length === 0) return 'these records';
        const tokens = this._records.map(record => record.find(attr => attr.name === this._infoAttribute).data);
        const lastInstance = tokens.pop();
        return `${tokens.join(', ')} and ${lastInstance}`
    }

    get html() {
        return `<p>Are you sure you want to delete ${this.infoStr}?</p>`
    }
}

customElements.define('dialog-delete-body', DialogDeleteBody);

export class DialogTitle extends HTMLElement {

}

customElements.define('dialog-title', DialogTitle);

export class DialogBody extends HTMLElement {

 }

customElements.define('dialog-body', DialogBody);


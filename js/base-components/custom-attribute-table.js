import { SingleRecordComponent } from "./component.js";
import { Events } from "./events.js";

export class CustomAttributesTable extends SingleRecordComponent {

  _inputFields = {};
  _checkboxes = {};

  _inputFieldConfig = [];

  
  _eventListeners = [
    { type: 'registerinput', callback: this._registerInput },
    { type: 'registercheckbox', callback: this._registerCheckbox },
    { type: 'select', callback: this._selectAttribute }
  ]

  _config = {
    readonly: false,
    disable: false,
    empty: false,
    novalues: false
  }

  _features = {
    select: false
  }

  connectedCallback(){
    super.connectedCallback();
    Events.invoke(this, 'register');
  }

  checkAttributes(attributes){
    attributes.forEach(attribute => this._checkboxes[attribute].check())
  }

  _selectAttribute(e){
    const column = e.target.data;
    if(e.target.selected){
      this._inputFields[column]?.enable();
      Events.send(this, "selectcolumn", column);
    } else {
      this._inputFields[column]?.disable();
      Events.send(this, "deselectcolumn", column);
    }
  }

  _registerInput(e){
    this._inputFields[e.target.column] = e.target;
  }

  _registerCheckbox(e){
    this._checkboxes[e.target.data] = e.target;
  }

  _getInputFieldConfig(attr){
    const config = [];
    if (attr.readonly || this._config.disable) config.push("readonly");
    if (this._config.empty) config.push("empty");
    return JSON.stringify(config);
  }

  update(record){
    this._record = record;
    super.render();
  }

  get userInput(){
    const attributes = [];
    Object.values(this._inputFields).filter(input => !input.disabled).forEach(input => {
         attributes.push({'name' : input.column, 'data' : input.value});
    });
    return attributes;
  }



  get html() {
    return `
      <table class="table ${this._classes}">
        <tbody>
          ${this._record.attributes
            .map(attr => {
              return `
                <tr>
                 ${this._features.select ? 
                `<td>${attr.readonly && !this._config.novalues ? "" : `<custom-check-box data='${attr.name}'></custom-check-box>`} </td>` : ""}
                 <td>${attr.name}</td>
                 ${this._config.novalues ? "" :
                  `${
                    this._config.readonly
                      ? `<td>${attr.data}</td>`
                      : `<td><custom-input-field data='${attr.data}' column='${attr.name}' type=${attr.type} config='${this._getInputFieldConfig(attr)}'></custom-input-field></td>`
                  }`
                }
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    `;
  }
  

  }


customElements.define('custom-attribute-table', CustomAttributesTable);
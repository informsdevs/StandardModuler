import { RecordListComponent } from "./component.js";

export class ToggleContainer extends RecordListComponent {


    connectedCallback() {
        super.connectedCallback();
        this.style.visibility = "hidden"
    }

    update(records, columns) {
        super.update(records, columns);
        this.style.visibility = records.length > 0 ? "visible" : "hidden";

    }



}

customElements.define('toggle-container', ToggleContainer);

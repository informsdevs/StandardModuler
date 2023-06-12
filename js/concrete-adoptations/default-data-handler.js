import { DataHandler } from "../base-components/data-handler.js";

export class DefaultDataHandler extends DataHandler {

    constructor() {
        super();
        this._renameProperties([["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"], ["attribute_9", "Manual Points"]])
            ._selectProperties(["Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points"])
            ._setPropertyTypes([["Academy", "Challenge", "Manual Points"], "number"])
            ._addSumProperty[["Academy", "Challenge", "Manual Points"], "Total"]
    }
}

customElements.define('default-data-handler', DefaultDataHandler);

import { platformccApiClient } from './api-clients.js'
import  *  as buttons from './base-components/custom-buttons.js'
import * as check from './base-components/custom-check-box.js'
import * as dialog from './base-components/custom-dialog.js'
import * as table from './base-components/custom-table.js'
import * as handler from './base-components/data-handler.js'
import * as events from './base-components/events.js'
import * as search from './base-components/search-field.js'
import * as hanlderImpl from './concrete-adoptations/default-data-handler.js'

resetData();
async function resetData(){
    const apiClient = platformccApiClient();
    await apiClient.resetTestData();
}
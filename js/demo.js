import { platformccApiClient } from './api-clients.js'
import * as table from './base-components/custom-table.js'
import * as handler from './base-components/data-handler.js'
import * as search from './base-components/search-field.js'

resetData();
async function resetData(){
    const apiClient = platformccApiClient();
    await apiClient.resetTestData();
}
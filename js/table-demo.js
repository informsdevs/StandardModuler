
window.addEventListener("DOMContentLoaded", async () => {

    const apiClient = await platformccApiClient();

    await apiClient.resetTestData();

    const table = simpleTable(apiClient)
        .selectIdentifier("tid")
        .renameColumns(["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"],  ["attribute_9", "Manual Points"])
        .referenceColumnsByName()
        .setInfoColumn("Name")
        .specifyColumnTypes(["Academy", "Challenge", "Manual Points"], "number")
        .createSumOfColumn(["Academy", "Challenge", "Manual Points"], "Total")
        .selectProperties("Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points", "Total")
        .sortInDescendingOrder("Total")
        .addBatchActions()
        .selectColumns("Name", "Academy", "Challenge", "Manual Points", "Total")
        .addSingleRecordActions()
        .mount(document.getElementById("stonortable"))





});


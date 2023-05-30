
window.addEventListener("DOMContentLoaded", async () => {

    const auth = {
        url: "https://in.informs.dk/api/api.php/records/platformcc6831243_tokens_793524",
        user: "dfhapiuser",
        password: "5M7MydYzwIChC2kXfQJtIoGARJyrGeLFj6UzEK85"
    }

    const apiClient = await platformccApiClient(auth);

    await apiClient.resetTestData();

   
    /* const table = simpleTable(apiClient)
        .selectIdentifier("tid")
        .renameColumns(["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"], ["attribute_9", "Manual Points"])
        .referenceColumnsByName()
        .setInfoColumn("Name")
        .specifyColumnTypes(["Academy", "Challenge", "Manual Points"], "number")
        .createSumOfColumn(["Academy", "Challenge", "Manual Points"], "Total")
        .selectProperties("Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points", "Total")
        .sortInDescendingOrder("Total")
        .addBatchActions()
        .addSendButton(printRecord)
        .selectColumns("Name", "Academy", "Challenge", "Manual Points", "Total")
        .addSingleRecordActions()
        .addSearchBar()
        .mount(document.getElementById("stonortable")) */
     
        const table = new Table(apiClient)
        .selectIdentifier("tid")
        .renameProperties(["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"], ["attribute_9", "Manual Points"])
        .referencePropByName()
        .changePropertyTypes(["Academy", "Challenge", "Manual Points"], "number")
        .addSumProperty(["Academy", "Challenge", "Manual Points"], "Total")
        .selectMainViewProperties("Name", "Academy", "Challenge", "Manual Points", "Total")
        .selectDialogViewProperties("Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points", "Total")
        .addNumberedRows()
        .sortInDescendingOrder("Total")
        .addSingleUnitButtons()
        .addClickSort()
        .addSendButton(print)
        .addRecordInfoLabel("Name")
        .mount('#stonortable')


        function print(record){
            console.log(record);
        }
  


});


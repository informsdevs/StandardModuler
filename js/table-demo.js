
window.addEventListener("DOMContentLoaded", async () => {

    const auth = {
        url: "https://in.informs.dk/api/api.php/records/platformcc6831243_tokens_793524",
        user: "dfhapiuser",
        password: "5M7MydYzwIChC2kXfQJtIoGARJyrGeLFj6UzEK85"
    }

    const apiClient = await platformccApiClient(auth);

    await apiClient.resetTestData();

    
        const table = new Table(apiClient)
        .selectIdentifier("tid")
        .renameProperties(["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"], ["attribute_9", "Manual Points"])
        .referencePropByName()
        .changePropertyTypes(["Academy", "Challenge", "Manual Points"], "number")
        .addSumProperty(["Academy", "Challenge", "Manual Points"], "Total")
        .selectMainViewProperties("Name", "Client", "Academy", "Challenge", "Manual Points", "Total")
        .selectDialogViewProperties("Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points", "Total")
        .addNumberedRows()
        .addSingleUnitButtons()
        .addClickSort()
        .addSendButton(print)
        .addRecordInfoLabel("Name")
        .addSearchFields("Name", "Client")
        .addTableButtons()
        .addConditionalCssClass("Total", Condition.GreaterThan, 100, "red") 
        .mount('#stonortable')


        const grid = new Grid(apiClient)
        .selectIdentifier("tid")
        .renameProperties(["attribute_1", "Employee Id"], ["attribute_2", "Name"], ["attribute_3", "Client"], ["attribute_4", "Country"], ["attribute_5", "Retailer"], ["attribute_6", "Store"], ["attribute_7", "Academy"], ["attribute_8", "Challenge"], ["attribute_9", "Manual Points"])
        .referencePropByName()
        .addSingleUnitButtons()
        .addRecordInfoLabel("Name")
        .changePropertyTypes(["Academy", "Challenge", "Manual Points"], "number")
        .addSumProperty(["Academy", "Challenge", "Manual Points"], "Total")
        .selectMainViewProperties("Name", "Client", "Total")
        .selectDialogViewProperties("Employee Id", "Name", "Client", "Country", "Retailer", "Store", "Academy", "Challenge", "Manual Points", "Total")
        .setRowCount(3)
        .mount('#stonortable2')

        function print(record){
            console.log(record);
        }
  


});



window.addEventListener("DOMContentLoaded", async () => {




    const apiClient  = mockApiClient();
  
    const table = defaultStylizedTable(apiClient)
        .addColumnsTogether(["academy", "challenge", "manual_points"], "Total")
        .sortInDescendingOrder("Total")
        .addBatchActions()
        .selectIdentifier("Employee_ID")
        .selectColumns("name", "challenge", "academy", "manual_points", "Total")
        .addSingleRecordActions()
        .mount(document.getElementById("stonortable"))

    console.log(table.getModalId())

    const apiClient2 = mockApiClient();

        const table2 = defaultTable(apiClient2)
        .addColumnsTogether(["academy", "challenge"], "Total")
        .sortInDescendingOrder("Total")
        .addSingleRecordActions()
        .mount(document.getElementById("stonortable2"))

});


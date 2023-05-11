
window.addEventListener("DOMContentLoaded", async () => {

   

    const apiClient  = mockApiClient();

  
    const table = defaultStylizedTable(apiClient)
        .addColumnsTogether(["academy", "challenge"], "Total")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .selectColumns("name", "challenge", "academy", "Total")
        .addSingleRecordActions()
        .mount(document.getElementById("table"))

    const apiClient2 = mockApiClient();

        const table2 = defaultTable(apiClient2)
        .addColumnsTogether(["academy", "challenge"], "Total")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .addSingleRecordActions()
        .mount(document.getElementById("table2"))

});


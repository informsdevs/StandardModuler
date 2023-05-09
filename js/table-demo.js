

import { simpleTable, defaultTable, defaultStylizedTable } from "https://astonor.github.io/GenericTable/js/table.js"

window.addEventListener("DOMContentLoaded", async () => {

    const auth = {
        url: "",
        user: "",
        password: ""
    }

    const response = await fetch(auth.url, {
        headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

    const data = await response.json();

    const table = defaultStylizedTable(data)
        .addColumnsTogether(["academy", "challange"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .mount(document.getElementById("table"))

    const employees = table.getDataSnapshot();

    function getStats(column) {
        const count = employees.length;
        const total = employees.map(employee => employee[column]).reduce((a, b) => a + b, 0);
        const average = total / count;

        return { count, total, average }
    }

    function getStatsTemplate(column, stats){
        return `
        <h3>${column.toUpperCase()}</h3>
        <p>Count: ${stats.count}</p>
        <p>Total: ${stats.total}</p>
        <p>Average: ${stats.average}</p>
        `
    }

    // ["academy", "challange", "Total"].forEach(column => {       
    //      document.getElementById(column).innerHTML = getStatsTemplate(column, getStats(column))
    // })

    const podium = document.getElementsByClassName("podium");
    [podium[1], podium[0], podium[2]].forEach((el, index) => {
        el.querySelector(".points").innerText = employees[index].Total;
        el.querySelector(".name").innerText = employees[index].name;
    })
});


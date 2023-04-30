

import { standardStylizedTable } from "../js/table.js"

window.addEventListener("DOMContentLoaded", async () => {

    const auth = {
        url: "https://ws-warehouse.cousab.se/api/leaderboards/v1/adidas-see",
        user: "workshop",
        password: "2gUph56Kcb6TeAf"
    }

    const response = await fetch(auth.url, {
        headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

    const data = await response.json();

    const table = standardStylizedTable(data)
        .addColumnsTogether(["challange", "academy"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .mount(document.getElementById("table"));

    const employees = table.getDataSnapshot();

    const podium = document.getElementsByClassName("podium");
    [podium[1], podium[0], podium[2]].forEach((el, index) => {
        el.querySelector(".points").innerText = employees[index].Total;
        el.querySelector(".name").innerText = employees[index].name;
    })
});

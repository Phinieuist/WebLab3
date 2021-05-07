$(document).ready(function () {

    async function GetShips() {
        // отправляет запрос и получаем ответ
        const response = await fetch("/ships", {
            method: "GET",
            headers: {"Accept": "application/json"}
        });
        // если запрос прошел нормально
        if (response.ok === true) {
            // получаем данные
            const ships = await response.json();
            let rows = document.querySelector("tbody");
            ships.forEach(one => {
                // добавляем полученные элементы в таблицу
                rows.append(row(one));
            });
        }
    }

    async function GetOneShip(id) {
        const response = await fetch("/ships/" + id, {
            method: "GET",
            headers: {"Accept": "application/json"}
        });
        if (response.ok === true) {
            const one = await response.json();
            const form = document.forms["shipsForm"];
            form.elements["id"].value = one.id;
            form.elements["name"].value = one.name;
            form.elements["age"].value = one.age;
            form.elements["price"].value = one.price;
        }
    }

    async function CreateOneShip(shipName, shipAge, shipPrice) {
        const response = await fetch("/ships", {
            method: "POST",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            body: JSON.stringify({
                name: shipName,
                age: parseInt(shipAge),
                price: parseInt(shipPrice)
            })
        });
        if (response.ok === true) {
            const one = await response.json();
            Reset();
            document.querySelector("tbody").append(row(one));
        }
    }

    async function EditOneShip(shipId, shipName, shipAge, shipPrice) {
        const response = await fetch("/ships", {
            method: "PUT",
            headers: {"Accept": "application/json", "Content-Type": "application/json"},
            body: JSON.stringify({
                id: shipId,
                name: shipName,
                age: parseInt(shipAge),
                price: parseInt(shipPrice)
            })
        });
        if (response.ok === true) {
            const one = await response.json();
            Reset();
            document.querySelector("tr[data-rowid='" + one.id + "']").replaceWith(row(one));
        }
    }

    async function DeleteOneShip(id) {
        const response = await fetch("/ships/" + id, {
            method: "DELETE",
            headers: {"Accept": "application/json"}
        });
        if (response.ok === true) {
            const one = await response.json();
            document.querySelector("tr[data-rowid='" + one.id + "']").remove();
        }
    }

    async function SearchShipsByPrice() {
        const form = document.forms["shipsForm"];
        const shipPrice = parseInt(form.elements["search_price"].value);
        
        console.log(shipPrice);
        if ((shipPrice <= 0) || (shipPrice == null) || !(Number.isInteger(shipPrice)))
        {
            GetShips();
            console.log("return");
            return;
        }    
        
        console.log("not return");
        const response = await fetch("/ships/search/" + shipPrice, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        if (response.ok === true) {
            Reset();
            const ships = await response.json();
            let rows = document.querySelector("tbody");
            ships.forEach(one => {
                rows.append(row(one));
            });
        }
    }

    function ClearTable() {
        let rows = document.querySelector("tbody");
        while (rows.rows[0])
            rows.deleteRow(0);
    }

// создание строки для таблицы
    function row(one) {

        const tr = document.createElement("tr");
        tr.setAttribute("data-rowid", one.id);

        const idTd = document.createElement("td");
        idTd.append(one.id);
        tr.append(idTd);

        const nameTd = document.createElement("td");
        nameTd.append(one.name);
        tr.append(nameTd);

        const ageTd = document.createElement("td");
        ageTd.append(one.age);
        tr.append(ageTd);

        const priceTd = document.createElement("td");
        priceTd.append(one.price);
        tr.append(priceTd);

        const linksTd = document.createElement("td");

        const editLink = document.createElement("a");
        editLink.setAttribute("data-id", one.id);
        editLink.setAttribute("style", "cursor:pointer;padding:15px;");
        editLink.append("Изменить");
        editLink.addEventListener("click", e => {

            e.preventDefault();
            GetOneShip(one.id);
        });
        linksTd.append(editLink);

        const removeLink = document.createElement("a");
        removeLink.setAttribute("data-id", one.id);
        removeLink.setAttribute("style", "cursor:pointer;padding:15px;");
        removeLink.append("Удалить");
        removeLink.addEventListener("click", e => {
            console.log(one.id);
            e.preventDefault();
            DeleteOneShip(one.id);
        });

        linksTd.append(removeLink);
        tr.appendChild(linksTd);

        return tr;
    }

// сброс значений формы
    document.getElementById('reset_form').addEventListener('click', function (e) {
        e.preventDefault();
        Reset();
    })

// сброс значений формы и поиска
    document.getElementById('reset_all').addEventListener('click', function (e) {
        e.preventDefault();
        Reset();
        ClearTable();
        GetShips();
    })

// сброс формы
    function Reset() {
        //const form = document.forms["shipsForm"];
        const form = document.getElementById("shipsForm")
        console.log(form);
        form.reset();
        form.elements["id"].value = 0;
    }


// поиск
    document.getElementById('search').addEventListener('click', function (e) {
        e.preventDefault();
        // Очищаем таблицу
        ClearTable();
        // Получаем результат
        SearchShipsByPrice();
    })

// отправка формы
    document.forms["shipsForm"].addEventListener("submit", e => {
        e.preventDefault();
        const form = document.forms["shipsForm"];
        const id = form.elements["id"].value;
        const name = form.elements["name"].value;
        const age = form.elements["age"].value;
        const price = form.elements["price"].value;
        if (id == 0)
            CreateOneShip(name, age, price);
        else
            EditOneShip(id, name, age, price);
    });

    GetShips();
});

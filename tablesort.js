$(function() {
    // Initialiser les datepickers
    $(".datepicker").datepicker({
        dateFormat: "dd/mm/yy"
    });
});

let eventsArray = [];
let themesData = {};
let formateursData = {};

// Fonction pour construire le tableau
function buildTable(data) {
    let table = document.getElementById('myTable');
    table.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        let event = data[i];
        let theme = themesData[event.theme_id];
        let formateur = formateursData[event.formateur_id];
        let row = `<tr style="background-color: ${theme.bck_color || '#fff'};">
            <td>${theme.name}</td>
            <td>${event.date_debut}</td>
            <td>${event.date_fin}</td>
            <td>${event.ville}</td>
            <td>${theme.type}</td>
            <td>${formateur.nom} ${formateur.prenom}</td>
        </tr>`;
        table.innerHTML += row;
    }
}

// Fonction pour filtrer par dates
function filterByDate(startDate, endDate, data) {
    let filteredData = [];
    for (let i = 0; i < data.length; i++) {
        let itemStartDate = new Date(data[i].date_debut.split('/').reverse().join('-'));
        let itemEndDate = new Date(data[i].date_fin.split('/').reverse().join('-'));
        if (itemStartDate >= startDate && itemEndDate <= endDate) {
            filteredData.push(data[i]);
        }
    }
    return filteredData;
}

// Fonction pour remplir la liste des formateurs pour le datalist
function populateFormateurList() {
    let formateurList = document.getElementById('formateurs-list');
    formateurList.innerHTML = '';
    for (let id in formateursData) {
        let formateur = formateursData[id];
        let option = document.createElement('option');
        option.value = `${formateur.nom} ${formateur.prenom}`;
        formateurList.appendChild(option);
    }
}

// Fonction pour remplir la liste des thèmes pour le datalist
function populateThemeList() {
    let themeList = document.getElementById('themes-list');
    themeList.innerHTML = '';
    for (let id in themesData) {
        let theme = themesData[id];
        let option = document.createElement('option');
        option.value = theme.name;
        themeList.appendChild(option);
    }
}

// Fonction pour récupérer les données JSON et construire le tableau
function fetchJsonData() {
    let storedData = localStorage.getItem('eventsData');
    if (storedData) {
        let data = JSON.parse(storedData);
        eventsArray = data.events;
        themesData = Object.fromEntries(data.themes.map(theme => [theme.id, theme]));
        formateursData = Object.fromEntries(data.formateurs.map(formateur => [formateur.id, formateur]));
        buildTable(eventsArray);
        populateFormateurList();
        populateThemeList();
    } else {
        fetch("./db.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                eventsArray = data.events;
                themesData = Object.fromEntries(data.themes.map(theme => [theme.id, theme]));
                formateursData = Object.fromEntries(data.formateurs.map(formateur => [formateur.id, formateur]));
                buildTable(eventsArray);
                populateFormateurList();
                populateThemeList();
                localStorage.setItem('eventsData', JSON.stringify(data));
            })
            .catch((error) => {
                console.error("Unable to fetch data:", error);
            });
    }
}

// Appeler fetchJsonData pour initialiser le tableau
fetchJsonData();

// Filtrage par dates
$('#filter-dates-btn').on('click', function() {
    let startDate = $('#date-debut-input').datepicker('getDate');
    let endDate = $('#date-fin-input').datepicker('getDate');
    if (startDate && endDate) {
        let filteredData = filterByDate(startDate, endDate, eventsArray);
        buildTable(filteredData);
    } else {
        alert('Veuillez sélectionner des dates valides.');
    }
});

// Recherche par thème
$('#theme-input').on('keyup', function() {
    let value = $(this).val();
    let data = searchTheme(value, eventsArray);
    buildTable(data);
});

function searchTheme(value, data) {
    let filteredTheme = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let theme = themesData[data[i].theme_id].name.toLowerCase();
        if (theme.includes(value)) {
            filteredTheme.push(data[i]);
        }
    }
    return filteredTheme;
}

// Recherche par financement
$('#finan-input').on('keyup', function() {
    let value = $(this).val();
    let data = searchFinan(value, eventsArray);
    buildTable(data);
});

function searchFinan(value, data) {
    let filteredFinan = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let themeType = themesData[data[i].theme_id].type.toLowerCase();
        if (themeType.includes(value)) {
            filteredFinan.push(data[i]);
        }
    }
    return filteredFinan;
}

// Recherche par formateur
$('#formateur-input').on('keyup', function() {
    let value = $(this).val();
    let data = searchForma(value, eventsArray);
    buildTable(data);
});

function searchForma(value, data) {
    let filteredForma = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let formateur = formateursData[data[i].formateur_id];
        let formateurName = `${formateur.nom} ${formateur.prenom}`.toLowerCase();
        if (formateurName.includes(value)) {
            filteredForma.push(data[i]);
        }
    }
    return filteredForma;
}

// Recherche par ville
$('#ville-input').on('keyup', function() {
    let value = $(this).val();
    let data = searchVille(value, eventsArray);
    buildTable(data);
});

function searchVille(value, data) {
    let filteredVille = [];
    value = value.toLowerCase();
    for (let i = 0; i < data.length; i++) {
        let ville = data[i].ville.toLowerCase();
        if (ville.includes(value)) {
            filteredVille.push(data[i]);
        }
    }
    return filteredVille;
}

// Tri des colonnes
$('th').on('click', function() {
    let column = $(this).data('colname');
    let order = $(this).data('order');
    let text = $(this).html();
    text = text.substring(0, text.length - 1);
    if (order === 'desc') {
        eventsArray = eventsArray.sort((a, b) => a[column] > b[column] ? 1 : -1);
        $(this).data("order", "asc");
        text += '&#9660';
    } else {
        eventsArray = eventsArray.sort((a, b) => a[column] < b[column] ? 1 : -1);
        $(this).data("order", "desc");
        text += '&#9650';
    }
    $(this).html(text);
    buildTable(eventsArray);
});

// Gestion de l'ajout de nouveaux thèmes
document.getElementById('add-theme-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let newThemeName = document.getElementById('new-theme').value;
    let newDateDebut = document.getElementById('new-date-debut').value;
    let newDateFin = document.getElementById('new-date-fin').value;
    let newVille = document.getElementById('new-ville').value;
    let newFinan = document.getElementById('new-finan').value;
    let newForma = document.getElementById('new-forma').value;

    let theme = Object.values(themesData).find(theme => theme.name === newThemeName);
    let formateur = Object.values(formateursData).find(formateur => `${formateur.nom} ${formateur.prenom}` === newForma);

    if (!theme || !newDateDebut || !newDateFin || !newVille || !newFinan || !formateur) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    let newEntry = {
        theme_id: theme.id,
        date_debut: newDateDebut,
        date_fin: newDateFin,
        ville: newVille,
        finan: newFinan,
        formateur_id: formateur.id
    };

    // Ajouter la nouvelle entrée au tableau de données
    eventsArray.push(newEntry);
    buildTable(eventsArray);

    // Sauvegarder les données mises à jour dans localStorage
    localStorage.setItem('eventsData', JSON.stringify({events: eventsArray, themes: Object.values(themesData), formateurs: Object.values(formateursData)}));

    // Réinitialiser le formulaire
    document.getElementById('add-theme-form').reset();
});

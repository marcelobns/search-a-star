var map_data = [];
var ui = {
    panel: document.getElementById("panel"),
    toggle: document.getElementById("panel-toggle"),
    summary: document.getElementById("panel-summary"),
    origin: document.getElementById("origin"),
    destiny: document.getElementById("destiny"),
    swap: document.getElementById("swap"),
    result: document.getElementById("result"),
    canvas: document.getElementById("map")
};

fetch("model/map.json")
    .then(function(response){ return response.json(); })
    .then(function(data){
        map_data = data;
        load_form(data);
        draw_stage(data);
        // começa com um exemplo para a demo já mostrar uma rota
        ui.origin.value = "Arad";
        ui.destiny.value = "Bucharest";
        update_route();
    });

// no mobile o painel começa recolhido, mostrando só o resumo da rota, para o mapa ficar visível
if (window.matchMedia("(max-width: 767px)").matches) {
    set_collapsed(true);
}
ui.origin.addEventListener("change", update_route);
ui.destiny.addEventListener("change", update_route);
ui.swap.addEventListener("click", function(){
    if (ui.destiny.value == "") return;
    var origin = ui.origin.value;
    ui.origin.value = ui.destiny.value;
    ui.destiny.value = origin;
    update_route();
});
// clicar numa cidade do mapa define o destino
ui.canvas.addEventListener("click", function(e){
    var city = city_at(e.offsetX, e.offsetY);
    if (city) {
        ui.destiny.value = city.name;
        update_route();
    }
});
ui.canvas.addEventListener("mousemove", function(e){
    ui.canvas.style.cursor = city_at(e.offsetX, e.offsetY) ? "pointer" : "default";
});
// painel recolhível (só tem efeito no mobile)
ui.toggle.addEventListener("click", function(){ set_collapsed(!ui.panel.classList.contains("collapsed")); });
ui.summary.addEventListener("click", function(){ set_collapsed(false); });

function set_collapsed(collapsed) {
    ui.panel.classList.toggle("collapsed", collapsed);
    ui.toggle.setAttribute("aria-expanded", !collapsed);
    ui.toggle.setAttribute("aria-label", collapsed ? "Expandir painel de rotas" : "Recolher painel de rotas");
    ui.toggle.firstElementChild.className = "fa " + (collapsed ? "fa-chevron-down" : "fa-chevron-up");
}
function load_form(data) {
    ui.destiny.appendChild(new Option("Selecione uma cidade...", ""));
    for (var i = 0; i < data.length; i++) {
        ui.origin.appendChild(new Option(data[i].name, data[i].name));
        ui.destiny.appendChild(new Option(data[i].name, data[i].name));
    }
}
function update_route() {
    var origin = ui.origin.value, destiny = ui.destiny.value;
    if (destiny == "") {
        show_empty("Escolha um destino para calcular a rota.");
        draw_path([]);
        return;
    }
    var route = find_path(map_data, origin, destiny);
    if (!route) {
        show_empty("Nenhuma rota encontrada.");
        draw_path([]);
        return;
    }
    show_route(route);
    draw_path(route.path);
}
function show_empty(message) {
    ui.result.innerHTML = "<div class='result-empty'>" + escape_html(message) + "</div>";
    ui.summary.innerHTML = "";
}
function show_route(route) {
    var path = route.path;
    var legs = path.length - 1;
    var via = path.slice(1, -1).map(function(city){ return city.name; });
    var meta = legs == 0 ? "Origem e destino são a mesma cidade"
        : (legs == 1 ? "1 trecho · ligação direta" : legs + " trechos · via " + via.join(", "));

    var steps = "";
    for (var i = 0; i < path.length; i++) {
        var type = i == 0 ? " step-origin" : (i == path.length - 1 ? " step-destiny" : "");
        var leg = i == 0 ? "" : "+" + road_cost(path[i - 1], path[i]) + " km";
        steps += "<li class='step" + type + "'><span class='step-name'>" + escape_html(path[i].name) + "</span>"
            + "<span class='step-leg'>" + leg + "</span></li>";
    }
    ui.result.innerHTML =
        "<div class='result-card'>"
        + "<div class='result-label'>Custo total</div>"
        + "<div class='result-total'>" + route.cost + "<small>km</small></div>"
        + "<div class='result-meta'>" + escape_html(meta) + "</div>"
        + "</div>"
        + "<ol class='steps'>" + steps + "</ol>";

    ui.summary.innerHTML = "<span class='summary-cost'>" + route.cost + " km</span>"
        + "<span class='summary-route'>" + escape_html(path[0].name + " → " + path[path.length - 1].name) + "</span>";
}
// Custo da estrada entre duas cidades vizinhas
function road_cost(from, to) {
    for (var i = 0; i < from.roads.length; i++) {
        if (get_pin(from.roads[i]) == to.name) return get_value(from.roads[i]);
    }
    return 0;
}
function escape_html(text) {
    return String(text).replace(/[&<>"']/g, function(c){
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c];
    });
}

// Desenho do mapa com a API nativa do Canvas 2D (sem bibliotecas)
// O canvas acompanha a largura do container e é redesenhado em alta resolução (telas retina)
var stage = {
    canvas: null,
    ctx: null,
    data: [],
    path: [],
    progress: 1,
    width: 0,
    height: 0,
    scale: 1,
    compact: false,
    bounds: null
};
var colors = {
    road: "rgba(255, 255, 255, 0.85)",
    road_border: "rgba(120, 110, 105, 0.25)",
    route: "#039be5",
    route_glow: "rgba(3, 155, 229, 0.35)",
    city: "#ffffff",
    city_border: "#8c8580",
    text: "#2c3e50",
    cost: "#8c8580",
    origin: "#2c3e50",
    destiny: "#e74c3c"
};
var font = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
var padding = {top: 30, right: 110, bottom: 30, left: 30};

function draw_stage(data) {
    stage.canvas = document.getElementById("map");
    stage.ctx = stage.canvas.getContext("2d");
    stage.data = data;
    stage.bounds = get_bounds(data);

    resize_stage();
    if (window.ResizeObserver) {
        new ResizeObserver(resize_stage).observe(stage.canvas.parentNode);
    } else {
        window.addEventListener("resize", resize_stage);
    }
}
// Anima o traçado da rota da origem ao destino
function draw_path(path) {
    stage.path = path;
    stage.progress = 0;

    var reduced_motion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var duration = Math.min(400 * (path.length - 1), 2000);
    if (reduced_motion || duration <= 0) {
        stage.progress = 1;
        render();
        return;
    }
    var start = null;
    function step(time) {
        if (stage.path !== path) return;
        if (start === null) start = time;
        var t = Math.min((time - start) / duration, 1);
        stage.progress = 1 - Math.pow(1 - t, 3);
        render();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
// Ajusta o tamanho do canvas ao container, mantendo a proporção do mapa
function resize_stage() {
    var b = stage.bounds;
    var map_width = b.max_x - b.min_x + padding.left + padding.right;
    var map_height = b.max_y - b.min_y + padding.top + padding.bottom;
    var dpr = window.devicePixelRatio || 1;

    stage.width = stage.canvas.parentNode.clientWidth;
    stage.scale = stage.width / map_width;
    stage.height = Math.round(map_height * stage.scale);
    // em telas pequenas os textos diminuem e só os custos da rota aparecem
    stage.compact = stage.scale < 0.7;

    stage.canvas.style.width = stage.width + "px";
    stage.canvas.style.height = stage.height + "px";
    stage.canvas.width = Math.round(stage.width * dpr);
    stage.canvas.height = Math.round(stage.height * dpr);
    stage.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
}
function render() {
    var ctx = stage.ctx;
    ctx.clearRect(0, 0, stage.width, stage.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    var roads = get_roads(stage.data);
    for (var i = 0; i < roads.length; i++) {
        draw_line([roads[i].a, roads[i].b], colors.road_border, stage.compact ? 6 : 8);
    }
    for (var i = 0; i < roads.length; i++) {
        draw_line([roads[i].a, roads[i].b], colors.road, stage.compact ? 3.5 : 5);
    }
    draw_route();
    // áreas ocupadas, para os nomes das cidades não cobrirem pontos e custos
    var boxes = [];
    for (var i = 0; i < stage.data.length; i++) {
        var p = point(stage.data[i]);
        boxes.push({x: p[0] - 6, y: p[1] - 6, width: 12, height: 12});
    }
    for (var i = 0; i < roads.length; i++) {
        var box = draw_cost(roads[i]);
        if (box) boxes.push(box);
    }
    for (var i = 0; i < stage.data.length; i++) {
        boxes.push(draw_city(stage.data[i], boxes));
    }
    if (stage.path.length > 0) {
        draw_marker(stage.path[0], colors.origin);
        if (stage.progress == 1) {
            draw_marker(stage.path[stage.path.length - 1], colors.destiny);
        }
    }
}
// Desenha a parte da rota já percorrida pela animação, proporcional à distância
function draw_route() {
    var path = stage.path;
    if (path.length < 2) return;

    var total = 0;
    for (var i = 1; i < path.length; i++) {
        total += euclidean_distance(point(path[i - 1]), point(path[i]));
    }
    var remaining = total * stage.progress;
    var points = [point(path[0])];
    for (var i = 1; i < path.length && remaining > 0; i++) {
        var a = point(path[i - 1]), b = point(path[i]);
        var length = euclidean_distance(a, b);
        var t = Math.min(remaining / length, 1);
        points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        remaining -= length;
    }
    draw_line(points, colors.route_glow, stage.compact ? 10 : 14);
    draw_line(points, colors.route, stage.compact ? 4 : 6);
}
function draw_line(points, color, width) {
    var ctx = stage.ctx;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}
// Custo da estrada no meio do trecho, destacado quando faz parte da rota
function draw_cost(road) {
    var ctx = stage.ctx;
    var x = (road.a[0] + road.b[0]) / 2,
        y = (road.a[1] + road.b[1]) / 2;
    var in_route = stage.progress == 1 && is_route_road(road);
    if (stage.compact && !in_route) return null;

    var height = stage.compact ? 14 : 16;
    ctx.font = (in_route ? "600 " : "") + (stage.compact ? "10px " : "11px ") + font;
    var width = ctx.measureText(road.cost).width + 8;
    ctx.fillStyle = in_route ? colors.route : "rgba(255, 255, 255, 0.9)";
    round_rect(x - width / 2, y - height / 2, width, height, height / 2);
    ctx.fill();

    ctx.fillStyle = in_route ? "#ffffff" : colors.cost;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(road.cost, x, y + 0.5);
    return {x: x - width / 2, y: y - height / 2, width: width, height: height};
}
// Desenha a cidade e escolhe o lado do nome (direita, esquerda, acima, abaixo) que menos cobre
// as áreas já ocupadas, sem sair do canvas. Retorna a área ocupada pelo nome.
function draw_city(city, boxes) {
    var ctx = stage.ctx;
    var p = point(city);
    var in_route = stage.path.indexOf(city) != -1;

    ctx.beginPath();
    ctx.arc(p[0], p[1], stage.compact ? 4 : 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.city;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = in_route ? colors.route : colors.city_border;
    ctx.stroke();

    // contorno claro no texto para manter a leitura sobre as estradas
    ctx.font = (in_route ? "600 " : "500 ") + (stage.compact ? "11px " : "13px ") + font;
    var width = ctx.measureText(city.name).width, height = stage.compact ? 12 : 14;
    var gap = stage.compact ? 8 : 12;
    var candidates = [
        {x: p[0] + gap, y: p[1] - height / 2},
        {x: p[0] - gap - width, y: p[1] - height / 2},
        {x: p[0] - width / 2, y: p[1] - gap - height},
        {x: p[0] - width / 2, y: p[1] + gap}
    ];
    var label = candidates[0], best = Infinity;
    for (var i = 0; i < candidates.length; i++) {
        var box = {x: candidates[i].x, y: candidates[i].y, width: width, height: height};
        var inside = box.x >= 0 && box.y >= 0 && box.x + width <= stage.width && box.y + height <= stage.height;
        var score = overlaps(box, boxes) + (inside ? 0 : 100);
        if (score < best) {
            label = candidates[i];
            best = score;
        }
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(240, 236, 233, 0.9)";
    ctx.strokeText(city.name, label.x, label.y + height / 2);
    ctx.fillStyle = colors.text;
    ctx.fillText(city.name, label.x, label.y + height / 2);
    return {x: label.x, y: label.y, width: width, height: height};
}
// Quantidade de áreas que a caixa cobre
function overlaps(box, boxes) {
    var count = 0;
    for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        if (box.x < b.x + b.width && box.x + box.width > b.x && box.y < b.y + b.height && box.y + box.height > b.y) {
            count++;
        }
    }
    return count;
}
function draw_marker(city, color) {
    var ctx = stage.ctx;
    var p = point(city);
    ctx.beginPath();
    ctx.arc(p[0], p[1], stage.compact ? 5 : 7, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = stage.compact ? 2.5 : 3;
    ctx.strokeStyle = color;
    ctx.stroke();
}
function round_rect(x, y, width, height, radius) {
    var ctx = stage.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}
// Converte as coordenadas do mapa (longitude, latitude) para pixels do canvas
function point(city) {
    var b = stage.bounds;
    return [
        (city.longitude - b.min_x + padding.left) * stage.scale,
        (city.latitude - b.min_y + padding.top) * stage.scale
    ];
}
function get_bounds(data) {
    var b = {min_x: Infinity, max_x: -Infinity, min_y: Infinity, max_y: -Infinity};
    for (var i = 0; i < data.length; i++) {
        b.min_x = Math.min(b.min_x, data[i].longitude);
        b.max_x = Math.max(b.max_x, data[i].longitude);
        b.min_y = Math.min(b.min_y, data[i].latitude);
        b.max_y = Math.max(b.max_y, data[i].latitude);
    }
    return b;
}
// Lista de estradas sem repetição (cada estrada aparece nas duas cidades do JSON)
function get_roads(data) {
    var roads = [];
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].roads.length; j++) {
            var city = json_find(data, "name", get_pin(data[i].roads[j]));
            if (city && data[i].name < city.name) {
                roads.push({from: data[i], to: city, a: point(data[i]), b: point(city), cost: get_value(data[i].roads[j])});
            }
        }
    }
    return roads;
}
function is_route_road(road) {
    var i = stage.path.indexOf(road.from), j = stage.path.indexOf(road.to);
    return i != -1 && j != -1 && Math.abs(i - j) == 1;
}

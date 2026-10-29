// Implementação do algoritmo A* (A_Estrela)
// Retorna {path: [nós da origem ao destino], cost: custo total} ou null se não houver caminho
function find_path(map, origin, destiny) {
    map = set_h_cost(map, destiny);

    var start = json_find(map, "name", origin);
    // lista aberta: fronteira de nós a expandir, ordenada pelo menor f_cost = g_cost + h_cost
    var open = [{node: start, g_cost: 0, f_cost: start.h_cost, path: [start]}];
    // menor g_cost (custo acumulado desde a origem) conhecido para cada nó
    var best_g_cost = {};
        best_g_cost[start.name] = 0;

    while (open.length > 0) {
        open.sort(function(a, b){ return a.f_cost - b.f_cost; });
        var current = open.shift();

        // o destino só é aceito quando sai da lista aberta, garantindo o menor custo
        if (current.node.name == destiny) {
            return {path: current.path, cost: current.g_cost};
        }
        // descarta entradas obsoletas, já superadas por um caminho mais barato até o mesmo nó
        if (current.g_cost > best_g_cost[current.node.name]) {
            continue;
        }
        for (var i = 0; i < current.node.roads.length; i++) {
            var road = json_find(map, "name", get_pin(current.node.roads[i]));
            var g_cost = current.g_cost + get_value(current.node.roads[i]);

            if (best_g_cost[road.name] !== undefined && g_cost >= best_g_cost[road.name]) {
                continue;
            }
            best_g_cost[road.name] = g_cost;
            open.push({node: road, g_cost: g_cost, f_cost: g_cost + road.h_cost, path: current.path.concat(road)});
        }
    }
    return null;
}
// Atribuição do h_cost(heuristic) baseado no destino, utilizando a fórmula √((ax - bx)² + (ay - by)²)
// As coordenadas estão em pixels e os custos em km, então a distância é multiplicada pela menor razão
// km/pixel entre as estradas do mapa. Assim h_cost nunca supera o custo real (heurística admissível e consistente).
function set_h_cost(data, goal) {
    goal = json_find(data, "name", goal);
    var scale = get_scale(data);
    for (var i = 0; i < data.length; i++) {
        data[i].h_cost = scale * euclidean_distance([data[i].longitude, data[i].latitude], [goal.longitude, goal.latitude]);
    }
    return data;
}
// Menor razão entre o custo de uma estrada (km) e a distância em linha reta entre suas cidades (pixels)
function get_scale(data) {
    var scale = Infinity;
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].roads.length; j++) {
            var road = json_find(data, "name", get_pin(data[i].roads[j]));
            var distance = euclidean_distance([data[i].longitude, data[i].latitude], [road.longitude, road.latitude]);
            if (distance > 0) {
                scale = Math.min(scale, get_value(data[i].roads[j]) / distance);
            }
        }
    }
    return scale == Infinity ? 0 : scale;
}

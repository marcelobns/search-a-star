var paths = [];
//Ajuste das variáveis antes de chamar o construtor de caminhos
function find_path(map, origin, destiny) {
    map = set_h_cost(map, destiny);
    paths = [];

    var node = json_find(map, "name", origin);
        node.g_cost = 0;
        node.f_cost = node.g_cost + node.h_cost;

    path_builder(map, node, []);

    return paths.slice();
}
// Implementação do algoritmo * de forma recursiva
function path_builder(map, node, path){
    path.push(node);

    if(node.h_cost == 0){
        node.g_cost = 0;
        paths[get_cost(path)] = path.slice();
        return paths;
    }
    node.roads = json_sort_values(node.roads);
    for (var i = 0; i < node.roads.length; i++) {
        var node_f_cost = Math.round(node.f_cost*2);

        var road = json_find(map, "name", get_pin(node.roads[i]));
            road.g_cost = get_value(node.roads[i]);
            road.f_cost = road.g_cost + road.h_cost;

        if(road.f_cost < node_f_cost && !json_find(path, "name", road.name)){
            node.g_cost = road.g_cost;
            path_builder(map, road, path);
            path.pop(node);
        }
    }
}
// Atribuição do h_cost(heuristic) baseado no destino, utilizando a fórmula √((ax - bx)² + (ay - by)²)
function set_h_cost(data, goal) {
    goal = json_find(data, "name", goal);
    for (var i = 0; i < data.length; i++) {
        data[i].h_cost = euclidean_distance([data[i].longitude, data[i].latitude], [goal.longitude, goal.latitude]);
    }
    return data;
}
// Soma do custo de um caminho
function get_cost(path) {
    var cost = 0
    for (var i = 0; i < path.length; i++) {
        cost += path[i].g_cost;
    }
    return cost;
}
//TODO guardar menor custo para diminuir recurvidade
//FIXME ajustar o g_cost

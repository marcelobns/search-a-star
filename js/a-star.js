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
    node.parents = json_sort_values(node.parents);
    for (var i = 0; i < node.parents.length; i++) {
        var node_f_cost = Math.round(node.f_cost*2);

        var parent = json_find(map, "name", get_pin(node.parents[i]));
            parent.g_cost = get_value(node.parents[i]);
            parent.f_cost = parent.g_cost + parent.h_cost;

        if(parent.f_cost < node_f_cost && !json_find(path, "name", parent.name)){
            node.g_cost = parent.g_cost;
            path_builder(map, parent, path);
            path.pop(node);
        }
    }
}
// The Euclidean distance formula √((ax - bx)² + (ay - by)²)
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
//FIXME ajustar o g_cost
//TODO guardar menor custo para refinar buscas

# A* Search

Demo da implementação do algoritmo de busca **A\*** (A-Estrela) em JavaScript puro, aplicada ao clássico mapa rodoviário da Romênia. Escolha uma cidade de origem e uma de destino: o A\* calcula a rota de menor custo e o traçado é animado sobre o mapa, desenhado com a API nativa do **Canvas 2D**.

**[▶ Ver a demo](https://marcelobns.github.io/project/search-a-star/)**

## Como rodar localmente

O mapa é carregado de `model/map.json` via requisição HTTP, então abrir o `index.html` direto pelo sistema de arquivos não funciona. Sirva a pasta com qualquer servidor estático:

```sh
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Estrutura

```text
search-a-star
├── css/
├── fonts/
├── img/
├── js/
│   ├── a-star.js   # algoritmo A* e heurística
│   ├── assets.js   # utilitários (busca no JSON, distância euclidiana)
│   ├── canvas.js   # renderização do mapa e da rota (Canvas 2D)
│   └── main.js     # interface: formulário e integração
├── model/
│   └── map.json    # cidades, coordenadas e estradas
└── index.html
```

## O algoritmo

A implementação está em [`js/a-star.js`](js/a-star.js). A busca mantém uma lista aberta (fronteira) ordenada pelo menor `f_cost = g_cost + h_cost`, onde `g_cost` é o custo acumulado desde a origem e `h_cost` é a estimativa da heurística até o destino. O destino só é aceito quando sai da lista aberta, o que garante o caminho de menor custo.

```js
// Retorna {path: [nós da origem ao destino], cost: custo total} ou null se não houver caminho
var route = find_path(map, "Arad", "Bucharest");

function find_path(map, origin, destiny) {
    map = set_h_cost(map, destiny);

    var start = json_find(map, "name", origin);
    var open = [{node: start, g_cost: 0, f_cost: start.h_cost, path: [start]}];
    var best_g_cost = {};
        best_g_cost[start.name] = 0;

    while (open.length > 0) {
        // expande sempre o nó com menor f_cost
        open.sort(function(a, b){ return a.f_cost - b.f_cost; });
        var current = open.shift();

        if (current.node.name == destiny) {
            return {path: current.path, cost: current.g_cost};
        }
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
```

### Heurística

A heurística é a distância euclidiana `√((ax - bx)² + (ay - by)²)`. Como as coordenadas do mapa estão em pixels e o custo das estradas em km, a distância é multiplicada pela menor razão km/pixel entre as estradas do mapa. Assim o `h_cost` nunca supera o custo real: a heurística é **admissível** e **consistente**.

## Dados do mapa

O arquivo [`model/map.json`](model/map.json) é um array de cidades com a seguinte estrutura:

```json
{
    "name": "Arad",
    "longitude": 49,
    "latitude": 136,
    "roads": [
        {"Timisoara": 118},
        {"Sibiu": 140},
        {"Zerind": 75}
    ]
}
```

`longitude` e `latitude` são as coordenadas (x, y) usadas no desenho, e `roads` lista as cidades vizinhas com o custo (km) para alcançar cada uma. Para usar outro mapa, basta seguir o mesmo formato.

## Licença

[GNU General Public License v3.0](LICENSE)

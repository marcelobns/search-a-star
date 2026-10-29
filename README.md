## Atividade de implementação do algorítmo A* Search
###### Atividade acadêmica [IABV 2016]
 Marcelo Barbosa [@github/marcelobns](https://github.com/marcelobns)

 Implementação do Algoritmo A_Estrela (**A* Search**). A solução foi escrita em **JavaScript** por motivo de facilidade na distribuição e utiliza uma estrutura de dados semi-estruturada **JSON** como fonte de dados. E por fim o mapa é desenhado com HTML **Canvas**.

 Todas as tecnologia utilizadas são livres e padrões da industria. [<a href="https://marcelobns.github.io/project/search-a-star/">Live Demo</a>]

#### JavaScript
 O JavaScript vem ganhando força de mercado por sua capacidade de resolver problemas de diversos tamanhos e complexidades. Padrão da indústria como linguagem Front-end para a web, também vem se consolidando como tecnologia Back-end e Desktop. [<a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript">Saiba mais</a>]

#### JSON
 JSON (JavaScript Object Notation) é uma estrutura de dados do tipo semi-estruturada, caracterizada por ser menos verbosa que o XML. É escrita em formato texto e completamente independente de linguagem, pois usa convenções que são familiares às linguagens C, Java, Perl, Python e muitas outras. Estas propriedades fazem com que JSON seja um formato ideal de troca de dados. [<a href="http://www.json.org/json-pt.html">Saiba mais</a>]

#### Canvas
 É um elemento HTML que pode ser utilizado para desenhar utilizando linguagem de "script". Pode ser usado, por exemplo para desenhar gráficos, fazer composições de imagens ou simples animações. [<a href="https://developer.mozilla.org/pt-BR/docs/Web/Guide/HTML/Canvas_tutorial">Saiba mais</a>]

### Estrutura do Projeto
* search-a-star
    * css        
    * fonts        
    * img        
    * js
        * **a-star.js**
        * assets.js
        * canvas.js
        * main.js        
    * model
        * **map.json**
    * index.html

O **Algoritmo** está implementado no arquivo **js/a-star.js**. A busca mantém uma lista aberta (fronteira) ordenada pelo menor `f_cost = g_cost + h_cost`, onde `g_cost` é o custo acumulado desde a origem e `h_cost` é a heurística. O destino só é aceito quando sai da lista aberta, o que garante o caminho de menor custo.

``` JS
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
A heurística é a distância euclidiana √((ax - bx)² + (ay - by)²). Como as coordenadas do mapa estão em pixels e o custo das estradas em km, a distância é multiplicada pela menor razão km/pixel entre as estradas do mapa. Assim o `h_cost` nunca supera o custo real, ou seja, a heurística é **admissível** e **consistente**.

Os dados são lidos do arquivo **model/map.json**. O arquivo armazena um array de objetos com a seguinte estrutura, que pode ser facilmente replicável.
``` JSON
{
    "name" : "Arad",
    "longitude" : 49,
    "latitude" : 136,    
    "roads" : [
        {"Timisoara": 118},
        {"Sibiu": 140},
        {"Zerind": 75}
    ]
},
```
longitude e latitude são utilizados para a representação gráfica(x,y), e o atributo roads lista os nós adjacentes e custo para alcançar cada um deles.

#### DEMO
Você pode conferir a demo em: <a href="https://marcelobns.github.io/project/search-a-star/">marcelobns.github.io</a>

## Licença de Uso
GNU GENERAL PUBLIC LICENSE <br>
   Version 3, 29 June 2007

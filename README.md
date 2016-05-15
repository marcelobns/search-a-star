## Atividade de implementação do algorítmo A* Search
###### Atividade acadêmica [IABV 2016]
 Marcelo Barbosa [@github/marcelobns](https://github.com/marcelobns)

 Implementação do Algoritmo A_Estrela (**A* Search**). A solução foi escrita em **JavaScript** por motivo de facilidade na distribuição e utiliza uma estrutura de dados semi-estruturada **JSON** como fonte de dados. E por fim o mapa é desenhado com HTML **Canvas**.

 Todas as tecnologia utilizadas são livres e padrões da industria. [<a href="http://marcelobns.github.io">Live Demo</a>]

#### JavaScript
 O JavaScript vem ganhando força de mercado por sua capacidade de resolver problemas de diversos tamanhos e complexidades. Padrão da indústria como linguagem Front-end para a web, também vem se consolidando como tecnologia Back-end e Desktop. [<a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript">Saiba mais</a>]

#### JSON
 JSON (JavaScript Object Notation) é uma estrutura de dados do tipo semi-estruturada, caracterizada por ser menos verbosa que o XML. É escrita em formato texto e completamente independente de linguagem, pois usa convenções que são familiares às linguagens C, Java, Perl, Python e muitas outras. Estas propriedades fazem com que JSON seja um formato ideal de troca de dados. [<a href="http://www.json.org/json-pt.html">Saiba mais</a>]

#### Canvas
 É um elemento HTML que pode ser utilizado para desenhar usando linguagem de "script". Pode ser usado, por exemplo para desenha gráficos, fazer composições de imagens ou simples animações. [<a href="https://developer.mozilla.org/pt-BR/docs/Web/Guide/HTML/Canvas_tutorial">Saiba mais</a>]

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

O **Algoritmo** está implementado no arquivo **js/a-star.js**. O algoritmo foi implementado de forma recursiva para respeitar o princípio **DRY** (don't repeat yourself).

``` JS
// Antes de montar o caminho é necessário calcular o h_cost(heuristic) baseado no destino
// utilizando a fórmula √((ax - bx)² + (ay - by)²)
map = set_h_cost(map, destiny);

// Chamada da função, último parametro vai vazio.
path_builder(map, node, []);

function path_builder(map, node, path){
    path.push(node);
    // Se o h_cost do nó for 0 então o caminho chegou ao destino
    if(node.h_cost == 0){
        node.g_cost = 0;
        paths[get_cost(path)] = path.slice();
        return paths;
    }
    // ordena os filhos pelo menor g_cost    
    node.parents = json_sort_values(node.parents);
    // percorre os filhos do nó atual
    for (var i = 0; i < node.parents.length; i++) {
        // ajuste de f_cost para o caminho não abrir nós na direção oposta ao destino
        var node_f_cost = Math.round(node.f_cost*2);

        // pega os dados do nó filho para calcular o f_cost
        var parent = json_find(map, "name", get_pin(node.parents[i]));
            parent.g_cost = get_value(node.parents[i]);
            parent.f_cost = parent.g_cost + parent.h_cost;

        // verifica se o caminho está na direção correta e se o nó filho não foi aberto
        if(parent.f_cost < node_f_cost && !json_find(path, "name", parent.name)){
            node.g_cost = parent.g_cost;
            path_builder(map, parent, path);
            path.pop(node);
        }
    }
}
```
Os dados são lidos do arquivo **model/map.json**. O arquivo armazena um array de objetos com a seguinte estrutura, que pode ser facilmente replicável.
``` JSON
{
    "name" : "Arad",
    "longitude" : 49,
    "latitude" : 136,    
    "parents" : [
        {"Timisoara": 118},
        {"Sibiu": 140},
        {"Zerind": 75}
    ]
},
```
longitude e latitude são utilizados para a representação gráfica(x,y), e o atributo parents lista os nós adjacentes e custo para alcançar cada um deles.

#### DEMO
Você pode conferir a demo em: <a href="http//marcelobns.github.io">marcelobns.github.io</a>

## Licença de Uso
GNU GENERAL PUBLIC LICENSE <br>
   Version 3, 29 June 2007

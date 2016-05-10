function get_pin(obj){
    return Object.keys(obj)[0]
}
function get_value(obj){
    if(obj == undefined){
        return 0;
    }
    return obj[Object.keys(obj)[0]];
}
function json_find(collection, field, needle) {
    for (var i = 0; i < collection.length; i++){
      if (collection[i][field] == needle){
          return collection[i];
      }
    }
    return false
}
function json_sort(collection, field){
	var aux;
	for (var i = 1; i < collection.length; i++) {
		aux = collection[i];
		var j = i;
		while(aux[field] < collection[j-1][field]) {
			collection[j] = collection[j-1];
			j--;
		};
		collection[j] = aux;
	};
	return collection;
}
function json_sort_values(collection) {
    var aux;
    for (var i = 1; i < collection.length; i++) {
        // debugger;
        aux = collection[i];
        var j = i;
        while(get_value(aux) < get_value(collection[j-1])) {
            collection[j] = collection[j-1];
            j--;
        };
        collection[j] = aux;
    };
    return collection;
}
// The Euclidean distance formula √((ax - bx)² + (ay - by)²)
function euclidean_distance(pointA, pointB) {
    var line = Math.sqrt(Math.pow(pointA[0] - pointB[0], 2) + Math.pow(pointA[1] - pointB[1], 2));
    return Math.round(line);
}

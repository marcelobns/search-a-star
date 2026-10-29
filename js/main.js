$(function(){
    $.getJSON("model/map.json", function(data){
        draw_stage(data);
        load_form(data);

        $("#find_path").on("click", function(e){
            $("#output li").remove();

            var origin = $("#origin").val();
            var destiny = $("#destiny").val();

            if(destiny != "") {
                var route = find_path(data, origin, destiny);
                if(route) {
                    var route_name = [];
                    for (var i = 0; i < route.path.length; i++) {
                        route_name.push(route.path[i].name);
                    }
                    var via = route_name.length > 2 ? "via "+route_name.slice(1, -1).join('/') : "direto";
                    $("#output").append("<li class='active'><a href='#'>"+via+"<span class='badge'>"+route.cost+"</span></a></li>");
                    draw_path(route.path);
                } else {
                    $("#output").append("<li><a href='#'>Nenhuma rota encontrada</a></li>");
                    draw_path([]);
                }
            }
        });
    });
    $("#nav-left").on("swipe", function(e){
        $('#nav-left').modal('hide')
    });
    $('#nav-left').on('shown.bs.modal', function (e) {
        $('#nav-left .modal-content')[0].scrollTop = 0;
    })
});
function load_form(data){
    $("#destiny").append("<option value=''>Selecione uma cidade...</option>");

    for (city of data) {
        $("#origin").append("<option value='"+city.name+"'>"+city.name+"</option>");
        $("#destiny").append("<option value='"+city.name+"'>"+city.name+"</option>");
    }
}

var routes = [];

$(function(){
    $.getJSON("model/map.json", function(data){
        draw_stage(data);
        load_form(data);

        $("#find_path").on("click", function(e){
            $("#output li").remove();

            var origin = $("#origin").val();
            var destiny = $("#destiny").val();

            if(destiny != "") {
                routes = find_path(data, origin, destiny);
                for (var i in routes) {
                    var route_name = [];
                    for (var j in routes[i]) {
                        route_name.push(routes[i][j].name);
                    }
                    route_name = route_name.slice(1, 4);
                    $("#output").append("<li id=r"+i+"><a href='#'>via "+route_name.join('/')+"<span class='badge'>"+i+"</span></a></li>")
                }
                $("#output li").first().addClass("active");
                var id = $("#output li").first()[0].id.replace('r','');
                draw_path(routes[id]);
            }
            $("#output li").on("click", function(e){
                $("#output li").removeClass("active");
                $(this).addClass("active");
                var id = this.id.replace('r','');
                draw_path(routes[id]);
            });
        });
    });
});
function load_form(data){
    $("#destiny").append("<option value=''>Selecione uma cidade...</option>");

    for (city of data) {
        $("#origin").append("<option value='"+city.name+"'>"+city.name+"</option>");
        $("#destiny").append("<option value='"+city.name+"'>"+city.name+"</option>");
    }
}

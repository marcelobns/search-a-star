var layer0 = new createjs.Stage("layer0"),
    layer1 = new createjs.Stage("layer1"),
    layer2 = new createjs.Stage("layer2");
    layer3 = new createjs.Stage("layer3");
function draw_stage(data) {
    $(data).each(function(i, city){
        var cityShape = new createjs.Shape();
        cityShape.graphics
            .beginStroke("rgba(120, 120, 120, 0.4)")
            .setStrokeStyle(2)
            .beginFill("rgba(220, 220, 220, 1)")
            .drawCircle(0, 0, 5);
        cityShape.x = city.longitude;
        cityShape.y = city.latitude;
        layer2.addChild(cityShape);

        var cityName = new createjs.Text(city.name, "14px Verdana", "#333");
        cityName.x = city.longitude+15;
        cityName.y = city.latitude;
        cityName.textBaseline = "alphabetic";

        layer2.addChild(cityName);
        layer2.update();

        $(city.parents).each(function(i, parent){
            parent = json_find(data, "name", Object.keys(parent)[0])
            if(parent){
                var roadShape = new createjs.Shape();
                roadShape.graphics.beginStroke("rgba(250, 250, 250, 0.5)")
                                    .setStrokeStyle(5, "round", "round");
                roadShape.graphics.moveTo(city.longitude, city.latitude);
                roadShape.graphics.lineTo(parent.longitude, parent.latitude);
                layer0.addChild(roadShape);
                layer0.update();
            }
        });
    });
}
function draw_path(data) {
    layer1.removeAllChildren();
    layer1.update();
    layer3.removeAllChildren();
    layer3.update();

    for (var i in data) {
        var roadShape = new createjs.Shape();
        roadShape.graphics.beginStroke("rgba(3,155,229, 0.7)")
                            .setStrokeStyle(5, "round", "round");
        if(i == data.length-1){
            draw_marker(data[i], "destiny");
        }
        if(i==0){
            roadShape.graphics.moveTo(data[i].longitude, data[i].latitude);
            draw_marker(data[i], "origin");
        } else {
            roadShape.graphics.moveTo(data[i-1].longitude, data[i-1].latitude);
        }
        roadShape.graphics.lineTo(data[i].longitude, data[i].latitude);

        layer1.addChild(roadShape);
        layer1.update();
    }
}
function draw_marker(node, type){
    var marker = new createjs.Shape();
    if(type == "origin"){
        marker.graphics
            .beginStroke("#2c3e50")
            .setStrokeStyle(3)
            .beginFill("#fff")
            .drawCircle(0, 0, 7);
        marker.x = node.longitude;
        marker.y = node.latitude;
    } else if (type == "destiny"){
        marker.graphics
            .beginStroke("#e74c3c")
            .setStrokeStyle(5)
            .beginFill("#2c3e50")
            .drawCircle(0, 0, 6);
        marker.x = node.longitude;
        marker.y = node.latitude;
    }
    layer3.addChild(marker);
    layer3.update();
}

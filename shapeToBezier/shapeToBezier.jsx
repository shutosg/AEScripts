var activeComp = app.project.activeItem;
function main() {
    if (activeComp instanceof CompItem == false) {
        alert("コンポが選択されていません。");
        return;
    }
    if (activeComp.selectedLayers.length == 0) {
        alert ("レイヤーを選択してください。");
        return;
    }
    var layers = activeComp.selectedLayers;
    for (var i=0; i<layers.length; i++) {
        if (layers[i] instanceof ShapeLayer == false) {
            continue;
        }
        var LOI = layers[i];
        LOI.enabled = false;
        LOI = LOI.duplicate();
        LOI.enabled = true;
        for (var j=1; j<=LOI.content.numProperties; j++) {
            var COI = LOI.content.property(j).content;
            var shapeGroup = LOI.content.property(j);
            xRecPath(shapeGroup);
            continue;
            for (var k=1; k<=COI.numProperties; k++) {
                var shapeGroup = COI.property(k);
                xRecPath(shapeGroup, k);
            }
        }
    }
}

function xRecPath(shapeGroup, idx) {
    if (idx > 2000) return;
    if (shapeGroup.matchName == "ADBE Vector Group") {
        for (var i=1; i<=shapeGroup.content.numProperties; i++) {
             xRecPath(shapeGroup.content.property(i), i);
        }
    } else if (shapeGroup.matchName == "ADBE Vector Shape - Rect") {
        var Rsize = shapeGroup.property(2).value;
        var Rpos = shapeGroup.property(3).value;
        // addPropertyしたりproperty.remove()するとshapeGroupやnewShapeへの参照が消えてしまうのでとりあえず親を持っておく
        var parent = shapeGroup.parentProperty;  
        var newShape = shapeGroup.parentProperty.addProperty("ADBE Vector Shape - Group");
        shapePath = newShape.property("ADBE Vector Shape");
        
        //  シェイプの設定
        var shapeProp = new Shape();
        shapeProp.vertices = [
                [Rsize[0]/2+Rpos[0], -Rsize[1]/2+Rpos[1]], 
                [Rsize[0]/2+Rpos[0], Rsize[1]/2+Rpos[1]],
                [-Rsize[0]/2+Rpos[0], Rsize[1]/2+Rpos[1]],
                [-Rsize[0]/2+Rpos[0], -Rsize[1]/2+Rpos[1]]
        ];
        shapeProp.closed = true;
        shapeProp.inTangents = [[0, 0], [0, 0], [0, 0], [0, 0]];
        shapeProp.outTangents = [[0, 0], [0, 0], [0, 0], [0, 0]];
        shapePath.setValue(shapeProp);
        
        //  長方形パス削除
        parent.property(idx).remove();
        
        //  パスを長方形パスと同じインデックスに
        parent.property(parent.numProperties).moveTo(idx);
        
    } else if (shapeGroup.matchName == "ADBE Vector Shape - Ellipse") {
        var Esize = shapeGroup.property(2).value;
        var Epos = shapeGroup.property(3).value;
        // addPropertyしたりproperty.remove()するとshapeGroupやnewShapeへの参照が消えてしまうのでとりあえず親を持っておく
        var parent = shapeGroup.parentProperty;  
        var newShape = shapeGroup.parentProperty.addProperty("ADBE Vector Shape - Group");
        shapePath = newShape.property("ADBE Vector Shape");
        
        //  シェイプの設定
        var shapeProp = new Shape();
        // 参考: https://spphire9.wordpress.com/2010/03/08/%E3%83%99%E3%82%B8%E3%82%A7%E6%9B%B2%E7%B7%9A%E3%81%A7%E6%A5%95%E5%86%86%E3%82%92%E6%8F%8F%E3%81%8F3/
        var cw = 4.0 * (Math.sqrt(2.0) - 1.0) * Esize[0]/2 / 3.0, ch = 4.0 * (Math.sqrt(2.0) - 1.0) * Esize[1]/2 / 3.0;
        shapeProp.vertices = [
                [Esize[0]/2+Epos[0], Epos[1]], 
                [Epos[0], Esize[1]/2+Epos[1]],
                [-Esize[0]/2+Epos[0], Epos[1]],
                [Epos[0], -Esize[1]/2+Epos[1]]
        ];
        shapeProp.closed = true;
        shapeProp.inTangents = [[0, -ch], [cw, 0], [0, ch], [-cw, 0]];
        shapeProp.outTangents = [[0, ch], [-cw, 0], [0, -ch], [cw, 0]];
        shapePath.setValue(shapeProp);
        
        //  楕円形パス削除
        parent.property(idx).remove();
        
        //  パスを楕円形パスと同じインデックスに
        parent.property(parent.numProperties).moveTo(idx);
        //alert(shapeGroup.parentProperty.parentProperty.name)
        
    } else if (shapeGroup.matchName == "ADBE Vector Shape - Star") {
        //alert("多角形だよ");
    } else if (shapeGroup.matchName == "ADBE Vector Shape - Group") {
        //alert("パスだよ");
    }
}

app.beginUndoGroup("shapeExpander");
main();
app.endUndoGroup();
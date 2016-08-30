//  コンポかレイヤーを選択した状態で使うと、新たにライトレイヤーを生成して、コンポかレイヤーのマーカーと同じ時間にキーフレームを打つ。
//  レイヤーが1枚選択されていればそのレイヤーのマーカーを使う。
//  コンポが選択されていれば(レイヤーが選択されていなければ)、そのコンポのマーカーを使う。
//  コンポのマーカーを取得するメソッドが用意されていないのでnariakiwataniさんのスクリプトをそのままお借りした。


var activeComp = app.project.activeItem;  //  プロジェクトパネルでアクティブなアイテムを取得

function main() {
    var markers = null;
    
    
    if (activeComp instanceof CompItem == false) {  //  アクティブなアイテムがコンポ以外ならはじく
        alert("コンポが選択されていません。");
        return;
    }
    if (activeComp.selectedLayers.length > 1) {  //  activeComp内で選択されているレイヤーが2枚以上ならはじく
        alert ("レイヤーを1つだけ選択するか、コンポのみ選択してください。\nレイヤーを選択していない場合はアクティブなコンポのマーカーが使われます。");
        return;
    } else if (activeComp.selectedLayers.length == 1) {  //  選択されているレイヤーが1枚ならそのレイヤーのマーカーを取得
        markers = activeComp.selectedLayers[0].property("Marker");
    } else if (activeComp.selectedLayers.length == 0) {  //  レイヤーが選択されていないならばそのコンポのマーカーを取得
        markers = getCompMarker(activeComp);
    }
    if (markers.numKeys < 1) {  //  マーカーが0ならはじく
        alert ("選択されているレイヤーかコンポにマーカーがありません。");
        return;
    }


    var newLight = activeComp.layers.addLight("Marker_Light", [0, 0]);  //  ライトレイヤーを生成して、newLightに格納
    newLight.property("position").setValue([0, 0, 0]);  //  ライトレイヤーの座標が初期だとキモいので変える
    newLight.property("pointOfInterest").setValue([0, 0, 100]);
    for (var i=0; i<=markers.numKeys; i++) {  //  取得したマーカーの分だけキーフレームを打つ
        var keyIdx = newLight.property("position").addKey((i==0)?0:markers.keyTime(i));  // キーフレームを打って、そのキーフレームのインデックスをkeyIdxに格納
        newLight.property("position").setValueAtKey(keyIdx, [0, 0, i*-10]);  //  格納したインデックスを元に、そのキーの座標値を変更
        //  同様に補間方法を変更
        newLight.property("position").setInterpolationTypeAtKey(keyIdx, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
    }


    var version = parseInt(app.version.split(".")[0]);
    var msg_export = "Marker_Light を生成しました。\n続けて.c4dファイルに出力しますか？";
    var code_export = (version>11)?5022:5006;
    var execute = confirm(msg_export);  //  確認ダイアログを表示
    if (execute) app.executeCommand(code_export);  //  yesならexporter起動
    
}

app.beginUndoGroup("markerToC4DasLight");  //  ここから
main();
app.endUndoGroup(); // ここまでの処理がアンドゥ1回で戻せる


/*
AfterEffectsでコンポジションマーカーを取得するスクリプト
2013.10.31 by nariakiiwatani
MIT License - http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
*/
 
// マーカーの情報を取得したいコンポジションを渡す
function getCompMarker(comp) {
 
// プロジェクトに含まれるコンポジションのリストを取得
function getCompAll(proj) {
    var ret = [];
    for(var i = 1; i <= proj.numItems; ++i) {
        if(proj.item(i) instanceof CompItem) {
            ret.push(proj.item(i));
        }
    }
    return ret;
}
// 配列の差分を取得
function getArrayDiff(a, b) {
    var ret = [];
    for(var _a in a) {
        var found = false;
        for(var _b in b) {
            if(a[_a] === b[_b]) {
                found = true;
                break;
            }
        }
        if(!found) {
            ret.push(a[_a]);
        }
    }
    var tmp = a;
    a = b;
    b = tmp;
    for(var _a in a) {
        var found = false;
        for(var _b in b) {
            if(a[_a] === b[_b]) {
                found = true;
                break;
            }
        }
        if(!found) {
            ret.push(a[_a]);
        }
    }
    return ret;
}
 
// プロジェクトウィンドウの選択情報を操作するので、操作前の状態を保存しておく
var selected = app.project.selection;
var selection = [];
for(var i = 0; i < selected.length; ++i) {
    selection.push(selected[i].selected);
    selected[i].selected = false;
}
 
// ここから処理の本体
comp.selected = true;   // 書き出し対象のコンポジションを選択状態にする
// 「複数アイテムから新規コンポジション」はプロジェクトウィンドウにフォーカスしていないと使えないので強制的にアクティブにする
app.project.showWindow(false);
app.project.showWindow(true);
 
var allComps = getCompAll(app.project); // コマンド実行前のコンポジションのリスト
app.executeCommand(2796);   // 「複数アイテムから新規コンポジション」を実行
var added = getArrayDiff(getCompAll(app.project), allComps)[0]; // コマンド実行によって追加されたコンポジションを探す
var marker = added.layer(1).marker; // これが欲しかったマーカー！
 
// ここから後片付け
added.remove(); // 増やしたコンポジションを削除
comp.selected = false;  // 選択状態を解除
for(var i = 0; i < selected.length; ++i) {   // スクリプト実行前の選択状態に戻す
    selected[i].selected = selection[i];
}
// マーカー情報を返す
return marker;
}
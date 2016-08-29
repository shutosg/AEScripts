var selComp = app.project.activeItem;
var word = "EverydayOneMotion";
var prefix = "letter_";
var sufix = "_";
var separator = '';


function main() {
    if (selComp === undefined) {
        alert("複製するコンポを選択してください");
        return;
    }
    var chars = str.split(separator);
    var arr = [];
    for (var i = 0, len = chars.length; i < len; i++) {
        if (!arr.has(chars[i])) { 
            arr.push(chars[i]);
            var comp = selComp.duplicate();
            comp.name = prefix + chars[i] + sufix;
        }
    }
}

Array.prototype.has = function(val) {
    for (var i=0, len=this.length; i<len; i++) {
        if (val === this[i]) return true;
    }
    return false;
}

main();
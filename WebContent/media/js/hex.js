var colorBackground=function(color){
	$('body').css({background: color});
};
var isColorName=function(val){
	return isNaN(parseInt(val,16));
};
var hexIsColor=function(hex){
	return hex.length===6 || hex.length===3;
};
var routeHashContent=function(winHash){
	var hcont=winHash.substr(1);
	if(isColorName(hcont)){
		colorBackground(hcont);
	} else {
		if(hexIsColor(hcont)) {
			colorBackground(winHash);
		}
	}
};
var routeHash=function(){
	var winHash=window.location.hash;
	if(winHash.length>1){
		routeHashContent(winHash);
	}
};
$(window).hashchange(routeHash);
routeHash();


var hexplus=function(){
	var colorBackground=function(color){
		$('body').css({background: color});
		updateForeground();
	};
	var map=function(fn,a){
		var r=[];
		for(var i=0;i<a.length;i++){
			r[i]=fn(a[i]);
		}
		return r;
	};
	var accumulate=function(accumulator,a){
		for(var i=0;i<a.length;i++){
			accumulator.i(a[i]);
		}
		return accumulator.o();
	};
	var toRGBPart=function(segment){
		return parseInt($.trim(segment));
	};
	var contrast=function(rgb){
		var contrastAccumulator=(function(){
			var total=0;
			return {
				i: function(rgbPart){
					total+=rgbPart;
				},
				o: function(){ 
					return (total/3) < 0x77 ? 'FFF' : '000'; 
				}
			};
		}());
		var colorArray=rgb
			.substr(4)
			.split(')')[0]
			.split(',');
		return "#"+accumulate(contrastAccumulator,map(toRGBPart,colorArray));
	};
	
	var updateForeground=function(){
		var b=$('body').css("background-color");
		var c=contrast(b);
		$('body').css({color: c});
	};
	
	var compile=function(n,fhex,fdec){
		if(isNaN(n)){
			return null;
		} else {
			return {
				val: n,
				hex: fhex(n),
				dec: fdec(n)
			};
		}
	};
	
	var parseInput=function(input){
		var n,hex,dec;
		if(input.length>1 && input.substring(0)==='t'){
			dec=input.substr(1);
			n=parseInt(dec);
			return compile(n,
					function(v){return v.toString(16)},
					function(){return dec;})
		} else {
			hex=input;
			n=parseInt(hex,16);
			return compile(n,
					function(){return hex},
					function(v){return v.toString();});
		}
	};
	var isColor=function(hex){
		return hex.length===6 || hex.length===3;
	};
	var routeHashContent=function(winHash){
		var hcont=winHash.substr(1);
		var n=parseInput(hcont);
		if(!n){
			//assume this is a color name
			colorBackground(hcont);
		} else {
			if(isColor(n.hex)){
				colorBackground('#'+n.hex);
				describeColor(n.hex);
			} else {
				colorBackground('#FFFFFF');
			}
			describeNumber(n);
		}
	};
	var decChunk=function(hex,i){
		return parseInt(hex.substr(i,2),16).toString();
	};
	var isDoubleChunk=function(hex,i){
		return hex.charAt(i)===hex.charAt(i+1);
	};
	var describeColor=function(hex){
		$('#rgb').text(decChunk(hex,0)+' '+decChunk(hex,2)+' '+decChunk(hex,4));
		if(isDoubleChunk(hex,0) && isDoubleChunk(hex,2) && isDoubleChunk(hex,4)){
			$('#short').text('#'+hex.charAt(0)+hex.charAt(2)+hex.charAt(4));
		} else {
			$('#short').text('none');
		}
	};
	var describeNumber=function(nInfo){
		$('#hex').text(nInfo.hex);
		$('#decimal').text(nInfo.dec);
	};
	var routeHash=function(){
		var winHash=window.location.hash;
		if(winHash.length>1){
			routeHashContent(winHash);
		}
	};
	
	$(window).hashchange(routeHash);
	routeHash();
};

hexplus();


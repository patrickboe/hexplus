/*!
 * hexpl.us application 11/21/2010
 * 
 * Copyright (c) 2010 Patrick Boe
 * Dual licensed under the MIT and GPL licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
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
	
	var toRGBParts=function(rgb){
		var colorArray=rgb
			.substr(4)
			.split(')')[0]
			.split(',');
		return map(toRGBPart,colorArray)
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
		return "#"+accumulate(contrastAccumulator,toRGBParts(rgb));
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
	
	var toPaddedHex=function(v){
		var hexString=toHexString(v);
		if(hexString.length===2){
			return hexString;
		}
		return "0" + hexString;
	};
	
	var toHexString=function(v){
		return v.toString(16)
	};
	
	var parseInput=function(input){
		var n,hex,dec;
		if(input.length>1 && input.charAt(0)==='t'){
			dec=input.substr(1);
			n=parseInt(dec);
			return compile(n,
					toHexString,
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
	
	var rgbToHex=function(rgb){
		var ret= map(toPaddedHex,toRGBParts(rgb)).join('');
		return ret;
	};
	
	var describeNamedColor=function(name){
		var renderedColor;
		var previousColor=$('body').css("background-color");
		colorBackground(name);
		renderedColor=$('body').css("background-color");
		if(renderedColor===previousColor && name!=='white'){
			return blank();
		}
		n=parseInput(rgbToHex(renderedColor));
		describeColor(n.hex);
		describeNumber(n);
	};
	
	var describeHexColor=function(n){
		colorBackground('#'+n.hex);
		describeNumber(n);
		describeColor(n.hex);
	};
	
	var describeNumberOnly=function(n){
		colorBackground('#FFFFFF');
		describeColorless();
		describeNumber(n);
	};
	
	var routeHashContent=function(winHash){
		var hashBody=winHash.substr(1);
		var n=parseInput(hashBody);
		if(!n){
			describeNamedColor(hashBody);
		} else if(isColor(n.hex)){
			describeHexColor(n);
		} else {
			describeNumberOnly(n);
		}
	};
	var decChunk=function(hex,i){
		return parseInt(hex.substr(i,2),16).toString();
	};
	var isDoubleChunk=function(hex,i){
		return hex.charAt(i)===hex.charAt(i+1);
	};
	var describeColorless=function(){
		$('#rgb').text('none');
	};
	var twice=function(c){
		return c + c;
	};
	var normalizeColorHex=function(hex){
		var ret="";
		if(hex.length!==3){
			return hex;
		}
		for(i=0;i<3;i++){
			ret+=twice(hex.charAt(i))
		}
		return ret;
	};
	var describeColor=function(hex){
		var norm=normalizeColorHex(hex);
		$('#rgb').text(decChunk(norm,0)+' '+decChunk(norm,2)+' '+decChunk(norm,4));
	};
	var blank=function(){
		colorBackground('white');
		describeColorless();
		$('#hex').text('none');
		$('#decimal').text('none');
	};
	var describeNumber=function(nInfo){
		$('#hex').text(nInfo.hex);
		$('#decimal').text(nInfo.dec);
	};
	var routeHash=function(){
		var winHash=window.location.hash;
		if(winHash.length>1){
			routeHashContent(winHash);
		} else {
			blank();
		}
	};
	var updateHash=function(){
		window.location.hash=$(this).val();
	};
	
	$(function(){
		$(window).hashchange(routeHash);
		routeHash();
		$('#query').bind("textchange",updateHash);
	});
};

hexplus();

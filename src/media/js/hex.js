/*!
 * hexpl.us application 11/21/2010
 * 
 * Copyright (c) 2010 Patrick Boe
 * Dual licensed under the MIT and GPL licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
var hexplus=function(){
	var loadedQuery='';
	var baseUrl=(function(){
			var b=window.location.href.split('#')[0];
			if(b.charAt(b.length-1)==='/'){
				b = b.substr(0,b.length-1);
			}
			return b;
		}());
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
		return parseInt($.trim(segment),10);
	};
	
	var isDark=function(rgb){
		var darkAccumulator=(function(){
			var total=0;
			return {
				i: function(rgbPart){
					total+=rgbPart;
				},
				o: function(){ 
					return (total/3) < 0x77; 
				}
			};
		}());
		return accumulate(darkAccumulator,toRGBParts(rgb));
	};
	
	var updateForeground=function(){
		var b=$('body').css("background-color");
		$('body').toggleClass('dark',isDark(b));
	};
	
	var toPaddedHex=function(v){
		var hexString=toHexString(v);
		if(hexString.length===2){
			return hexString;
		}
		return "0" + hexString;
	};
	
	var rebaser=function(b){
		return function(v){
			return v.toString(b);
		};
	};
	
	var toOctString=rebaser(8), toHexString=rebaser(16), toDecString=rebaser(10);
	var identityMaker=function(x){
		return function(){
			return x;
		};
	};
	
	var strictParseInt=function(str,base){
		for(var i=1;i<str.length;i++){ //make sure characters after the first are numeric
			if(isNaN(parseInt(str.charAt(i),base))){
				return NaN;
			}
		}
		return parseInt(str,base);
	};
	
	var makeParser=function(base){
		return function(str){
			var n=strictParseInt(str,base);
			if(isNaN(n)){
				return null;
			} else {
				return {
					val: n,
					hex: toHexString(n),
					dec: toDecString(n),
					oct: toOctString(n)
				};
			}
		}
	};
	
	var specialParsers={
		t: makeParser(10),
		o: makeParser(8)
	};
	
	var hexParser=makeParser(16);
	
	var parseInput=function(input){
		var prefix;
		if(input.length>1){
			prefix=input.charAt(0);
			if(specialParsers.hasOwnProperty(prefix)){
				return specialParsers[prefix](input.substr(1));
			}
		}
		return hexParser(input);
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
		accept(n);
	};
	
	var describeHexColor=function(n){
		colorBackground('#'+n.hex);
		describeColor(n.hex);
		accept(n);
	};
	
	var describeNumberOnly=function(n){
		whiteout();
		accept(n);
	};
	
	var routeEmptyHash=function(){
		$('#query').val('');
		blank();
	};
	
	var routeHashBody=function(hashBody){
		var n=parseInput(hashBody);
		$('#query').val(hashBody);
		if(!n){
			describeNamedColor(hashBody);
		} else if(isColor(n.hex)){
			describeHexColor(n);
		} else {
			describeNumberOnly(n);
		}
	};
	var decimalChunk=function(hex){
		ret=[];
		for(var i=0; i<3; i++){
			ret[i]=parseInt(hex.substr(i*2,2),16).toString();
		}
		return ret;
	};
	var isDoubleChunk=function(hex,i){
		return hex.charAt(i)===hex.charAt(i+1);
	};
	var whiteout=function(){
		colorBackground('white');
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
		$('#rgb').text(decimalChunk(norm).join(' '));
	};
	var blank=function(){
		whiteout();
		$('#hex,#decimal,#oct').text('none');
	};
	var accept=function(n){
		describeNumber(n);
	};
	var describeNumber=function(nInfo){
		$('#hex').text(nInfo.hex.toUpperCase());
		$('#decimal').text(nInfo.dec);
		$('#oct').text(nInfo.oct);
	};
	
	var routeHash=function(){
		var h=window.location.hash;
		if(h.length>0 && h.charAt(0)==='#'){
			h=(h.substr(1));
		}
		routeQuery(h);
	};
	
	var routeQuery=function(q){
		if(loadedQuery!==q.toLowerCase()){
			loadedQuery=q.toLowerCase();
			updateLink(q);
			if(q.length>0){
				routeHashBody(q);
			} else {
				routeEmptyHash();
			}
		}
	};
	
	var updateLink=function(q){
		var lookupUrl=baseUrl;
		if(/^\w+$/i.test(q)){ //accept only alphanumeric characters in query
			lookupUrl+='#'+q;
		}
		$('#lookupUrl').attr('href',lookupUrl).text(lookupUrl);
	};
	
	var textQuery=function(){
		routeQuery($(this).val());
	};
	
	$(function(){
		$(window).hashchange(routeHash);
		routeHash();
		$('#query').bind("textchange",textQuery);
	});
};

hexplus();


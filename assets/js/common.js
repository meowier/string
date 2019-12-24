/*! https://mths.be/utf8js v3.0.0 by @mathias */
;(function(root) {

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	function checkScalarValue(codePoint) {
		if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
			throw Error(
				'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
				' is not a scalar value'
			);
		}
	}
	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			checkScalarValue(codePoint);
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function utf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read first byte
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				checkScalarValue(codePoint);
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function utf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	root.version = '3.0.0';
	root.encode = utf8encode;
	root.decode = utf8decode;

}(typeof exports === 'undefined' ? this.utf8 = {} : exports));

/****************************************************************************************************/
Encoder = {

	// When encoding do we convert characters into html or numerical entities
	EncodeType : "entity",  // entity OR numerical

	isEmpty : function(val){
		if(val){
			return ((val===null) || val.length==0 || /^\s+$/.test(val));
		}else{
			return true;
		}
	},
	
	// arrays for conversion from HTML Entities to Numerical values
	arr1: ['&nbsp;','&iexcl;','&cent;','&pound;','&curren;','&yen;','&brvbar;','&sect;','&uml;','&copy;','&ordf;','&laquo;','&not;','&shy;','&reg;','&macr;','&deg;','&plusmn;','&sup2;','&sup3;','&acute;','&micro;','&para;','&middot;','&cedil;','&sup1;','&ordm;','&raquo;','&frac14;','&frac12;','&frac34;','&iquest;','&Agrave;','&Aacute;','&Acirc;','&Atilde;','&Auml;','&Aring;','&AElig;','&Ccedil;','&Egrave;','&Eacute;','&Ecirc;','&Euml;','&Igrave;','&Iacute;','&Icirc;','&Iuml;','&ETH;','&Ntilde;','&Ograve;','&Oacute;','&Ocirc;','&Otilde;','&Ouml;','&times;','&Oslash;','&Ugrave;','&Uacute;','&Ucirc;','&Uuml;','&Yacute;','&THORN;','&szlig;','&agrave;','&aacute;','&acirc;','&atilde;','&auml;','&aring;','&aelig;','&ccedil;','&egrave;','&eacute;','&ecirc;','&euml;','&igrave;','&iacute;','&icirc;','&iuml;','&eth;','&ntilde;','&ograve;','&oacute;','&ocirc;','&otilde;','&ouml;','&divide;','&oslash;','&ugrave;','&uacute;','&ucirc;','&uuml;','&yacute;','&thorn;','&yuml;','&quot;','&amp;','&lt;','&gt;','&OElig;','&oelig;','&Scaron;','&scaron;','&Yuml;','&circ;','&tilde;','&ensp;','&emsp;','&thinsp;','&zwnj;','&zwj;','&lrm;','&rlm;','&ndash;','&mdash;','&lsquo;','&rsquo;','&sbquo;','&ldquo;','&rdquo;','&bdquo;','&dagger;','&Dagger;','&permil;','&lsaquo;','&rsaquo;','&euro;','&fnof;','&Alpha;','&Beta;','&Gamma;','&Delta;','&Epsilon;','&Zeta;','&Eta;','&Theta;','&Iota;','&Kappa;','&Lambda;','&Mu;','&Nu;','&Xi;','&Omicron;','&Pi;','&Rho;','&Sigma;','&Tau;','&Upsilon;','&Phi;','&Chi;','&Psi;','&Omega;','&alpha;','&beta;','&gamma;','&delta;','&epsilon;','&zeta;','&eta;','&theta;','&iota;','&kappa;','&lambda;','&mu;','&nu;','&xi;','&omicron;','&pi;','&rho;','&sigmaf;','&sigma;','&tau;','&upsilon;','&phi;','&chi;','&psi;','&omega;','&thetasym;','&upsih;','&piv;','&bull;','&hellip;','&prime;','&Prime;','&oline;','&frasl;','&weierp;','&image;','&real;','&trade;','&alefsym;','&larr;','&uarr;','&rarr;','&darr;','&harr;','&crarr;','&lArr;','&uArr;','&rArr;','&dArr;','&hArr;','&forall;','&part;','&exist;','&empty;','&nabla;','&isin;','&notin;','&ni;','&prod;','&sum;','&minus;','&lowast;','&radic;','&prop;','&infin;','&ang;','&and;','&or;','&cap;','&cup;','&int;','&there4;','&sim;','&cong;','&asymp;','&ne;','&equiv;','&le;','&ge;','&sub;','&sup;','&nsub;','&sube;','&supe;','&oplus;','&otimes;','&perp;','&sdot;','&lceil;','&rceil;','&lfloor;','&rfloor;','&lang;','&rang;','&loz;','&spades;','&clubs;','&hearts;','&diams;'],
	arr2: ['&#160;','&#161;','&#162;','&#163;','&#164;','&#165;','&#166;','&#167;','&#168;','&#169;','&#170;','&#171;','&#172;','&#173;','&#174;','&#175;','&#176;','&#177;','&#178;','&#179;','&#180;','&#181;','&#182;','&#183;','&#184;','&#185;','&#186;','&#187;','&#188;','&#189;','&#190;','&#191;','&#192;','&#193;','&#194;','&#195;','&#196;','&#197;','&#198;','&#199;','&#200;','&#201;','&#202;','&#203;','&#204;','&#205;','&#206;','&#207;','&#208;','&#209;','&#210;','&#211;','&#212;','&#213;','&#214;','&#215;','&#216;','&#217;','&#218;','&#219;','&#220;','&#221;','&#222;','&#223;','&#224;','&#225;','&#226;','&#227;','&#228;','&#229;','&#230;','&#231;','&#232;','&#233;','&#234;','&#235;','&#236;','&#237;','&#238;','&#239;','&#240;','&#241;','&#242;','&#243;','&#244;','&#245;','&#246;','&#247;','&#248;','&#249;','&#250;','&#251;','&#252;','&#253;','&#254;','&#255;','&#34;','&#38;','&#60;','&#62;','&#338;','&#339;','&#352;','&#353;','&#376;','&#710;','&#732;','&#8194;','&#8195;','&#8201;','&#8204;','&#8205;','&#8206;','&#8207;','&#8211;','&#8212;','&#8216;','&#8217;','&#8218;','&#8220;','&#8221;','&#8222;','&#8224;','&#8225;','&#8240;','&#8249;','&#8250;','&#8364;','&#402;','&#913;','&#914;','&#915;','&#916;','&#917;','&#918;','&#919;','&#920;','&#921;','&#922;','&#923;','&#924;','&#925;','&#926;','&#927;','&#928;','&#929;','&#931;','&#932;','&#933;','&#934;','&#935;','&#936;','&#937;','&#945;','&#946;','&#947;','&#948;','&#949;','&#950;','&#951;','&#952;','&#953;','&#954;','&#955;','&#956;','&#957;','&#958;','&#959;','&#960;','&#961;','&#962;','&#963;','&#964;','&#965;','&#966;','&#967;','&#968;','&#969;','&#977;','&#978;','&#982;','&#8226;','&#8230;','&#8242;','&#8243;','&#8254;','&#8260;','&#8472;','&#8465;','&#8476;','&#8482;','&#8501;','&#8592;','&#8593;','&#8594;','&#8595;','&#8596;','&#8629;','&#8656;','&#8657;','&#8658;','&#8659;','&#8660;','&#8704;','&#8706;','&#8707;','&#8709;','&#8711;','&#8712;','&#8713;','&#8715;','&#8719;','&#8721;','&#8722;','&#8727;','&#8730;','&#8733;','&#8734;','&#8736;','&#8743;','&#8744;','&#8745;','&#8746;','&#8747;','&#8756;','&#8764;','&#8773;','&#8776;','&#8800;','&#8801;','&#8804;','&#8805;','&#8834;','&#8835;','&#8836;','&#8838;','&#8839;','&#8853;','&#8855;','&#8869;','&#8901;','&#8968;','&#8969;','&#8970;','&#8971;','&#9001;','&#9002;','&#9674;','&#9824;','&#9827;','&#9829;','&#9830;'],
		
	// Convert HTML entities into numerical entities
	HTML2Numerical : function(s){
		return this.swapArrayVals(s,this.arr1,this.arr2);
	},	

	// Convert Numerical entities into HTML entities
	NumericalToHTML : function(s){
		return this.swapArrayVals(s,this.arr2,this.arr1);
	},


	// Numerically encodes all unicode characters
	numEncode : function(s){ 
		if(this.isEmpty(s)) return ""; 

		var a = [],
			l = s.length; 
		
		for (var i=0;i<l;i++){ 
			var c = s.charAt(i); 
			if (c < " " || c > "~"){ 
				a.push("&#"); 
				a.push(c.charCodeAt()); //numeric value of code point 
				a.push(";"); 
			}else{ 
				a.push(c); 
			} 
		} 
		
		return a.join(""); 	
	}, 
	
	// HTML Decode numerical and HTML entities back to original values
	htmlDecode : function(s){

		var c,m,d = s;
		
		if(this.isEmpty(d)) return "";

		// convert HTML entites back to numerical entites first
		d = this.HTML2Numerical(d);
		
		// look for numerical entities &#34;
		arr=d.match(/&#[0-9]{1,5};/g);
		
		// if no matches found in string then skip
		if(arr!=null){
			for(var x=0;x<arr.length;x++){
				m = arr[x];
				c = m.substring(2,m.length-1); //get numeric part which is refernce to unicode character
				// if its a valid number we can decode
				if(c >= -32768 && c <= 65535){
					// decode every single match within string
					d = d.replace(m, String.fromCharCode(c));
				}else{
					d = d.replace(m, ""); //invalid so replace with nada
				}
			}			
		}

		return d;
	},		

	// encode an input string into either numerical or HTML entities
	htmlEncode : function(s,dbl){
			
		if(this.isEmpty(s)) return "";

		// do we allow double encoding? E.g will &amp; be turned into &amp;amp;
		dbl = dbl || false; //default to prevent double encoding
		
		// if allowing double encoding we do ampersands first
		if(dbl){
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}
		}

		// convert the xss chars to numerical entities ' " < >
		s = this.XSSEncode(s,false);
		
		if(this.EncodeType=="numerical" || !dbl){
			// Now call function that will convert any HTML entities to numerical codes
			s = this.HTML2Numerical(s);
		}

		// Now encode all chars above 127 e.g unicode
		s = this.numEncode(s);

		// now we know anything that needs to be encoded has been converted to numerical entities we
		// can encode any ampersands & that are not part of encoded entities
		// to handle the fact that I need to do a negative check and handle multiple ampersands &&&
		// I am going to use a placeholder

		// if we don't want double encoded entities we ignore the & in existing entities
		if(!dbl){
			s = s.replace(/&#/g,"##AMPHASH##");
		
			if(this.EncodeType=="numerical"){
				s = s.replace(/&/g, "&#38;");
			}else{
				s = s.replace(/&/g, "&amp;");
			}

			s = s.replace(/##AMPHASH##/g,"&#");
		}
		
		// replace any malformed entities
		s = s.replace(/&#\d*([^\d;]|$)/g, "$1");

		if(!dbl){
			// safety check to correct any double encoded &amp;
			s = this.correctEncoding(s);
		}

		// now do we need to convert our numerical encoded string into entities
		if(this.EncodeType=="entity"){
			s = this.NumericalToHTML(s);
		}

		return s;					
	},

	// Encodes the basic 4 characters used to malform HTML in XSS hacks
	XSSEncode : function(s,en){
		if(!this.isEmpty(s)){
			en = en || true;
			// do we convert to numerical or html entity?
			if(en){
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&quot;");
				s = s.replace(/</g,"&lt;");
				s = s.replace(/>/g,"&gt;");
			}else{
				s = s.replace(/\'/g,"&#39;"); //no HTML equivalent as &apos is not cross browser supported
				s = s.replace(/\"/g,"&#34;");
				s = s.replace(/</g,"&#60;");
				s = s.replace(/>/g,"&#62;");
			}
			return s;
		}else{
			return "";
		}
	},

	// returns true if a string contains html or numerical encoded entities
	hasEncoded : function(s){
		if(/&#[0-9]{1,5};/g.test(s)){
			return true;
		}else if(/&[A-Z]{2,6};/gi.test(s)){
			return true;
		}else{
			return false;
		}
	},

	// will remove any unicode characters
	stripUnicode : function(s){
		return s.replace(/[^\x20-\x7E]/g,"");
		
	},

	// corrects any double encoded &amp; entities e.g &amp;amp;
	correctEncoding : function(s){
		return s.replace(/(&amp;)(amp;)+/,"$1");
	},


	// Function to loop through an array swaping each item with the value from another array e.g swap HTML entities with Numericals
	swapArrayVals : function(s,arr1,arr2){
		if(this.isEmpty(s)) return "";
		var re;
		if(arr1 && arr2){
			//ShowDebug("in swapArrayVals arr1.length = " + arr1.length + " arr2.length = " + arr2.length)
			// array lengths must match
			if(arr1.length == arr2.length){
				for(var x=0,i=arr1.length;x<i;x++){
					re = new RegExp(arr1[x], 'g');
					s = s.replace(re,arr2[x]); //swap arr1 item with matching item from arr2	
				}
			}
		}
		return s;
	},

	inArray : function( item, arr ) {
		for ( var i = 0, x = arr.length; i < x; i++ ){
			if ( arr[i] === item ){
				return i;
			}
		}
		return -1;
	}

}
/************************************************************* Base64 ***********************************************************/  
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(e) {
        var a, t, r, i, n, o, l, s = "", c = 0;
        for (e = Base64._utf8_encode(e); c < e.length; )
            i = (a = e.charCodeAt(c++)) >> 2,
            n = (3 & a) << 4 | (t = e.charCodeAt(c++)) >> 4,
            o = (15 & t) << 2 | (r = e.charCodeAt(c++)) >> 6,
            l = 63 & r,
            isNaN(t) ? o = l = 64 : isNaN(r) && (l = 64),
            s = s + this._keyStr.charAt(i) + this._keyStr.charAt(n) + this._keyStr.charAt(o) + this._keyStr.charAt(l);
        return s
    },
    decode: function(e) {
        var a, t, r, i, n, o, l = "", s = 0;
        for (e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); s < e.length; )
            a = this._keyStr.indexOf(e.charAt(s++)) << 2 | (i = this._keyStr.indexOf(e.charAt(s++))) >> 4,
            t = (15 & i) << 4 | (n = this._keyStr.indexOf(e.charAt(s++))) >> 2,
            r = (3 & n) << 6 | (o = this._keyStr.indexOf(e.charAt(s++))),
            l += String.fromCharCode(a),
            64 != n && (l += String.fromCharCode(t)),
            64 != o && (l += String.fromCharCode(r));
        return l = Base64._utf8_decode(l)
    },
    _utf8_encode: function(e) {
        e = e.replace(/\r\n/g, "\n");
        for (var a = "", t = 0; t < e.length; t++) {
            var r = e.charCodeAt(t);
            r < 128 ? a += String.fromCharCode(r) : (127 < r && r < 2048 ? a += String.fromCharCode(r >> 6 | 192) : (a += String.fromCharCode(r >> 12 | 224),
            a += String.fromCharCode(r >> 6 & 63 | 128)),
            a += String.fromCharCode(63 & r | 128))
        }
        return a
    },
    _utf8_decode: function(e) {
        for (var a = "", t = 0, r = c1 = c2 = 0; t < e.length; )
            (r = e.charCodeAt(t)) < 128 ? (a += String.fromCharCode(r),
            t++) : 191 < r && r < 224 ? (c2 = e.charCodeAt(t + 1),
            a += String.fromCharCode((31 & r) << 6 | 63 & c2),
            t += 2) : (c2 = e.charCodeAt(t + 1),
            c3 = e.charCodeAt(t + 2),
            a += String.fromCharCode((15 & r) << 12 | (63 & c2) << 6 | 63 & c3),
            t += 3);
        return a
    }
};
/************************************************************************************************************************************/
/***************************************** Upside Down Text  *******************************************/
var HTMLTable = {
    '"': "' '",
    "&": "&",
    "<": "<",
    ">": ">",
    "Â": "¡",
    "Â": "¢",
    "Â": "£",
    "Â": "¤",
    "Â": "¥",
    "Â": "¦",
    "Â": "§",
    "Â": "¨",
    "Â": "©",
    "Â": "ª",
    "Â": "«",
    "Â": "¬",
    "Â": "­",
    "Â": "®",
    "Â": "¯",
    "Â": "°",
    "Â": "±",
    "Â": "²",
    "Â": "³",
    "Â": "´",
    "Â": "µ",
    "Â": "¶",
    "Â": "·",
    "Â": "¸",
    "Â": "¹",
    "Â": "º",
    "Â": "»",
    "Â": "¼",
    "Â": "½",
    "Â": "¾",
    "Â": "¿",
    "Ã": "À",
    "Ã": "Á",
    "Ã": "Â",
    "Ã": "Ã",
    "Ã": "Ä",
    "Ã": "Å",
    "Ã": "Æ",
    "Ã": "Ç",
    "Ã": "È",
    "Ã": "É",
    "Ã": "Ê",
    "Ã": "Ë",
    "Ã": "Ì",
    "Ã": "Í",
    "Ã": "Î",
    "Ã": "Ï",
    "Ã": "Ð",
    "Ã": "Ñ",
    "Ã": "Ò",
    "Ã": "Ó",
    "Ã": "Ô",
    "Ã": "Õ",
    "Ã": "Ö",
    "Ã": "×",
    "Ã": "Ø",
    "Ã": "Ù",
    "Ã": "Ú",
    "Ã": "Û",
    "Ã": "Ü",
    "Ã": "Ý",
    "Ã": "Þ",
    "Ã": "ß",
    "Ã": "à",
    "Ã": "á",
    "Ã": "â",
    "Ã": "ã",
    "Ã": "ä",
    "Ã": "å",
    "Ã": "æ",
    "Ã": "ç",
    "Ã": "è",
    "Ã": "é",
    "Ã": "ê",
    "Ã": "ë",
    "Ã": "ì",
    "Ã": "í",
    "Ã": "î",
    "Ã": "ï",
    "Ã": "ð",
    "Ã": "ñ",
    "Ã": "ò",
    "Ã": "ó",
    "Ã": "ô",
    "Ã": "õ",
    "Ã": "ö",
    "Ã": "÷",
    "Ã": "ø",
    "Ã": "ù",
    "Ã": "ú",
    "Ã": "û",
    "Ã": "ü",
    "Ã": "ý",
    "Ã": "þ",
    "Ã": "ÿ",
    "Å": "Œ",
    "Å": "œ",
    "Å": "Š",
    "Å": "š",
    "Å": "Ÿ",
    "Æ": "ƒ",
    "Ë": "ˆ",
    "Ë": "˜",
    "Î": "?",
    "Î": "?",
    "Î": "G",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "T",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "S",
    "Î": "?",
    "Î": "?",
    "Î": "F",
    "Î": "?",
    "Î": "?",
    "Î": "O",
    "Î": "a",
    "Î": "ß",
    "Î": "?",
    "Î": "d",
    "Î": "e",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Î": "µ",
    "Î": "?",
    "Î": "?",
    "Î": "?",
    "Ï": "p",
    "Ï": "?",
    "Ï": "?",
    "Ï": "s",
    "Ï": "t",
    "Ï": "?",
    "Ï": "f",
    "Ï": "?",
    "Ï": "?",
    "Ï": "?",
    "Ï": "?",
    "Ï": "?",
    "Ï": "?",
    "â": " ",
    "â": " ",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "–",
    "â": "—",
    "â": "‘",
    "â": "’",
    "â": "‚",
    "â": "“",
    "â": "”",
    "â": "„",
    "â": "†",
    "â": "‡",
    "â": "•",
    "â": "…",
    "â": "‰",
    "â": "'",
    "â": "?",
    "â": "‹",
    "â": "›",
    "â": "?",
    "â": "/",
    "â": "€",
    "â": "I",
    "â": "P",
    "â": "R",
    "â": "™",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "Ø",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "-",
    "â": "*",
    "â": "v",
    "â": "?",
    "â": "8",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "n",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "~",
    "â": "?",
    "â": "˜",
    "â": "?",
    "â": "=",
    "â": "=",
    "â": "=",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "·",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?",
    "â": "?"
}
  , flipTable = {
    a: "ɐ",
    b: "q",
    c: "ɔ",
    d: "p",
    e: "ǝ",
    f: "ɟ",
    g: "ƃ",
    h: "ɥ",
    i: "ᴉ",
    j: "ɾ",
    k: "ʞ",
    m: "ɯ",
    n: "u",
    r: "ɹ",
    t: "ʇ",
    v: "ʌ",
    w: "ʍ",
    y: "ʎ",
    A: "∀",
    C: "Ɔ",
    E: "Ǝ",
    F: "Ⅎ",
    G: "פ",
    H: "H",
    I: "I",
    J: "ſ",
    L: "˥",
    M: "W",
    N: "N",
    P: "Ԁ",
    T: "┴",
    U: "∩",
    V: "Λ",
    Y: "⅄",
    1: "Ɩ",
    2: "ᄅ",
    3: "Ɛ",
    4: "ㄣ",
    5: "ϛ",
    6: "9",
    7: "ㄥ",
    8: "8",
    9: "6",
    0: "0",
    ".": "˙",
    ",": "'",
    "'": ",",
    '"': ",,",
    "`": ",",
    "?": "¿",
    "!": "¡",
    "[": "]",
    "]": "[",
    "(": ")",
    ")": "(",
    "{": "}",
    "}": "{",
    "<": ">",
    ">": "<",
    "&": "⅋",
    _: "‾",
    "∴": "∵",
    "⁅": "⁆"
}
  , flipTableFlipped = {
    "ɐ": "a",
    q: "b",
    "ɔ": "c",
    p: "d",
    "ǝ": "e",
    "ɟ": "f",
    "ƃ": "g",
    "ɥ": "h",
    "ᴉ": "i",
    "ɾ": "j",
    "ʞ": "k",
    "ɯ": "m",
    u: "n",
    "ɹ": "r",
    "ʇ": "t",
    "ʌ": "v",
    "ʍ": "w",
    "ʎ": "y",
    "∀": "A",
    "Ɔ": "C",
    "Ǝ": "E",
    "Ⅎ": "F",
    "פ": "G",
    H: "H",
    I: "I",
    "ſ": "J",
    "˥": "L",
    W: "M",
    N: "N",
    "Ԁ": "P",
    "┴": "T",
    "∩": "U",
    "Λ": "V",
    "⅄": "Y",
    "Ɩ": "1",
    "ᄅ": "2",
    "Ɛ": "3",
    "ㄣ": "4",
    "ϛ": "5",
    9: "6",
    "ㄥ": "7",
    8: "8",
    6: "9",
    0: "0",
    "˙": ".",
    "'": ",",
    ",": "'",
    ",,": '"',
    ",": "`",
    "¿": "?",
    "¡": "!",
    "]": "[",
    "[": "]",
    ")": "(",
    "(": ")",
    "}": "{",
    "{": "}",
    ">": "<",
    "<": ">",
    "⅋": "&",
    "‾": "_",
    "∵": "∴",
    "⁆": "⁅"
}
  , flipTableHTML = {
    "ɐ": "?",
    "ɔ": "?",
    "ǝ": "?",
    "ɟ": "?",
    "ƃ": "?",
    "ɥ": "?",
    "ᴉ": "?",
    "ɾ": "?",
    "ʞ": "?",
    "ɯ": "?",
    "ɹ": "?",
    "ʇ": "?",
    "ʌ": "?",
    "ʍ": "?",
    "ʎ": "?",
    "∀": "?",
    "Ɔ": "?",
    "Ǝ": "?",
    "Ⅎ": "?",
    "פ": "?",
    "ſ": "?",
    "˥": "?",
    "Ԁ": "?",
    "┴": "-",
    "∩": "n",
    "Λ": "?",
    "⅄": "?",
    "Ɩ": "?",
    "ᄅ": "?",
    "Ɛ": "?",
    "ㄣ": "?",
    "ϛ": "?",
    "ㄥ": "?",
    "˙": "?",
    "¿": "¿",
    "¡": "¡",
    "⅋": "?",
    "‾": "?",
    "∵": "?",
    "∴": "?",
    "⁆": "?",
    "⁅": "?"
};
function flipString(e) {
    for (var l = "", t = e.length - 1; 0 <= t; --t)
        l += flipChar(e.charAt(t));
    return l
}
function flipChar(e) {
    return flipTable[e] || flipTableFlipped[e] || flipTable[e.toLowerCase()] || e
}
/***********************************************MD5 **************************************************/
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);
/****************************SHA1*******************************************/
!function(){"use strict";var root="object"==typeof window?window:{},NODE_JS=!root.JS_SHA1_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;NODE_JS&&(root=global);var COMMON_JS=!root.JS_SHA1_NO_COMMON_JS&&"object"==typeof module&&module.exports,AMD="function"==typeof define&&define.amd,HEX_CHARS="0123456789abcdef".split(""),EXTRA=[-2147483648,8388608,32768,128],SHIFT=[24,16,8,0],OUTPUT_TYPES=["hex","array","digest","arrayBuffer"],blocks=[],createOutputMethod=function(t){return function(h){return new Sha1(!0).update(h)[t]()}},createMethod=function(){var t=createOutputMethod("hex");NODE_JS&&(t=nodeWrap(t)),t.create=function(){return new Sha1},t.update=function(h){return t.create().update(h)};for(var h=0;h<OUTPUT_TYPES.length;++h){var s=OUTPUT_TYPES[h];t[s]=createOutputMethod(s)}return t},nodeWrap=function(method){var crypto=eval("require('crypto')"),Buffer=eval("require('buffer').Buffer"),nodeMethod=function(t){if("string"==typeof t)return crypto.createHash("sha1").update(t,"utf8").digest("hex");if(t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(void 0===t.length)return method(t);return crypto.createHash("sha1").update(new Buffer(t)).digest("hex")};return nodeMethod};function Sha1(t){t?(blocks[0]=blocks[16]=blocks[1]=blocks[2]=blocks[3]=blocks[4]=blocks[5]=blocks[6]=blocks[7]=blocks[8]=blocks[9]=blocks[10]=blocks[11]=blocks[12]=blocks[13]=blocks[14]=blocks[15]=0,this.blocks=blocks):this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],this.h0=1732584193,this.h1=4023233417,this.h2=2562383102,this.h3=271733878,this.h4=3285377520,this.block=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1,this.first=!0}Sha1.prototype.update=function(t){if(!this.finalized){var h="string"!=typeof t;h&&t.constructor===root.ArrayBuffer&&(t=new Uint8Array(t));for(var s,e,i=0,r=t.length||0,o=this.blocks;i<r;){if(this.hashed&&(this.hashed=!1,o[0]=this.block,o[16]=o[1]=o[2]=o[3]=o[4]=o[5]=o[6]=o[7]=o[8]=o[9]=o[10]=o[11]=o[12]=o[13]=o[14]=o[15]=0),h)for(e=this.start;i<r&&e<64;++i)o[e>>2]|=t[i]<<SHIFT[3&e++];else for(e=this.start;i<r&&e<64;++i)(s=t.charCodeAt(i))<128?o[e>>2]|=s<<SHIFT[3&e++]:s<2048?(o[e>>2]|=(192|s>>6)<<SHIFT[3&e++],o[e>>2]|=(128|63&s)<<SHIFT[3&e++]):s<55296||s>=57344?(o[e>>2]|=(224|s>>12)<<SHIFT[3&e++],o[e>>2]|=(128|s>>6&63)<<SHIFT[3&e++],o[e>>2]|=(128|63&s)<<SHIFT[3&e++]):(s=65536+((1023&s)<<10|1023&t.charCodeAt(++i)),o[e>>2]|=(240|s>>18)<<SHIFT[3&e++],o[e>>2]|=(128|s>>12&63)<<SHIFT[3&e++],o[e>>2]|=(128|s>>6&63)<<SHIFT[3&e++],o[e>>2]|=(128|63&s)<<SHIFT[3&e++]);this.lastByteIndex=e,this.bytes+=e-this.start,e>=64?(this.block=o[16],this.start=e-64,this.hash(),this.hashed=!0):this.start=e}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this}},Sha1.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,h=this.lastByteIndex;t[16]=this.block,t[h>>2]|=EXTRA[3&h],this.block=t[16],h>=56&&(this.hashed||this.hash(),t[0]=this.block,t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.hBytes<<3|this.bytes>>>29,t[15]=this.bytes<<3,this.hash()}},Sha1.prototype.hash=function(){var t,h,s=this.h0,e=this.h1,i=this.h2,r=this.h3,o=this.h4,H=this.blocks;for(t=16;t<80;++t)h=H[t-3]^H[t-8]^H[t-14]^H[t-16],H[t]=h<<1|h>>>31;for(t=0;t<20;t+=5)s=(h=(e=(h=(i=(h=(r=(h=(o=(h=s<<5|s>>>27)+(e&i|~e&r)+o+1518500249+H[t]<<0)<<5|o>>>27)+(s&(e=e<<30|e>>>2)|~s&i)+r+1518500249+H[t+1]<<0)<<5|r>>>27)+(o&(s=s<<30|s>>>2)|~o&e)+i+1518500249+H[t+2]<<0)<<5|i>>>27)+(r&(o=o<<30|o>>>2)|~r&s)+e+1518500249+H[t+3]<<0)<<5|e>>>27)+(i&(r=r<<30|r>>>2)|~i&o)+s+1518500249+H[t+4]<<0,i=i<<30|i>>>2;for(;t<40;t+=5)s=(h=(e=(h=(i=(h=(r=(h=(o=(h=s<<5|s>>>27)+(e^i^r)+o+1859775393+H[t]<<0)<<5|o>>>27)+(s^(e=e<<30|e>>>2)^i)+r+1859775393+H[t+1]<<0)<<5|r>>>27)+(o^(s=s<<30|s>>>2)^e)+i+1859775393+H[t+2]<<0)<<5|i>>>27)+(r^(o=o<<30|o>>>2)^s)+e+1859775393+H[t+3]<<0)<<5|e>>>27)+(i^(r=r<<30|r>>>2)^o)+s+1859775393+H[t+4]<<0,i=i<<30|i>>>2;for(;t<60;t+=5)s=(h=(e=(h=(i=(h=(r=(h=(o=(h=s<<5|s>>>27)+(e&i|e&r|i&r)+o-1894007588+H[t]<<0)<<5|o>>>27)+(s&(e=e<<30|e>>>2)|s&i|e&i)+r-1894007588+H[t+1]<<0)<<5|r>>>27)+(o&(s=s<<30|s>>>2)|o&e|s&e)+i-1894007588+H[t+2]<<0)<<5|i>>>27)+(r&(o=o<<30|o>>>2)|r&s|o&s)+e-1894007588+H[t+3]<<0)<<5|e>>>27)+(i&(r=r<<30|r>>>2)|i&o|r&o)+s-1894007588+H[t+4]<<0,i=i<<30|i>>>2;for(;t<80;t+=5)s=(h=(e=(h=(i=(h=(r=(h=(o=(h=s<<5|s>>>27)+(e^i^r)+o-899497514+H[t]<<0)<<5|o>>>27)+(s^(e=e<<30|e>>>2)^i)+r-899497514+H[t+1]<<0)<<5|r>>>27)+(o^(s=s<<30|s>>>2)^e)+i-899497514+H[t+2]<<0)<<5|i>>>27)+(r^(o=o<<30|o>>>2)^s)+e-899497514+H[t+3]<<0)<<5|e>>>27)+(i^(r=r<<30|r>>>2)^o)+s-899497514+H[t+4]<<0,i=i<<30|i>>>2;this.h0=this.h0+s<<0,this.h1=this.h1+e<<0,this.h2=this.h2+i<<0,this.h3=this.h3+r<<0,this.h4=this.h4+o<<0},Sha1.prototype.hex=function(){this.finalize();var t=this.h0,h=this.h1,s=this.h2,e=this.h3,i=this.h4;return HEX_CHARS[t>>28&15]+HEX_CHARS[t>>24&15]+HEX_CHARS[t>>20&15]+HEX_CHARS[t>>16&15]+HEX_CHARS[t>>12&15]+HEX_CHARS[t>>8&15]+HEX_CHARS[t>>4&15]+HEX_CHARS[15&t]+HEX_CHARS[h>>28&15]+HEX_CHARS[h>>24&15]+HEX_CHARS[h>>20&15]+HEX_CHARS[h>>16&15]+HEX_CHARS[h>>12&15]+HEX_CHARS[h>>8&15]+HEX_CHARS[h>>4&15]+HEX_CHARS[15&h]+HEX_CHARS[s>>28&15]+HEX_CHARS[s>>24&15]+HEX_CHARS[s>>20&15]+HEX_CHARS[s>>16&15]+HEX_CHARS[s>>12&15]+HEX_CHARS[s>>8&15]+HEX_CHARS[s>>4&15]+HEX_CHARS[15&s]+HEX_CHARS[e>>28&15]+HEX_CHARS[e>>24&15]+HEX_CHARS[e>>20&15]+HEX_CHARS[e>>16&15]+HEX_CHARS[e>>12&15]+HEX_CHARS[e>>8&15]+HEX_CHARS[e>>4&15]+HEX_CHARS[15&e]+HEX_CHARS[i>>28&15]+HEX_CHARS[i>>24&15]+HEX_CHARS[i>>20&15]+HEX_CHARS[i>>16&15]+HEX_CHARS[i>>12&15]+HEX_CHARS[i>>8&15]+HEX_CHARS[i>>4&15]+HEX_CHARS[15&i]},Sha1.prototype.toString=Sha1.prototype.hex,Sha1.prototype.digest=function(){this.finalize();var t=this.h0,h=this.h1,s=this.h2,e=this.h3,i=this.h4;return[t>>24&255,t>>16&255,t>>8&255,255&t,h>>24&255,h>>16&255,h>>8&255,255&h,s>>24&255,s>>16&255,s>>8&255,255&s,e>>24&255,e>>16&255,e>>8&255,255&e,i>>24&255,i>>16&255,i>>8&255,255&i]},Sha1.prototype.array=Sha1.prototype.digest,Sha1.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(20),h=new DataView(t);return h.setUint32(0,this.h0),h.setUint32(4,this.h1),h.setUint32(8,this.h2),h.setUint32(12,this.h3),h.setUint32(16,this.h4),t};var exports=createMethod();COMMON_JS?module.exports=exports:(root.sha1=exports,AMD&&define(function(){return exports}))}();
/***************************SHA256*********************************************/
var sha256=function r(t){function n(r,t){return r>>>t|r<<32-t}for(var o,e,f=Math.pow,h=f(2,32),a="",l=[],g=8*t.length,c=r.h=r.h||[],i=r.k=r.k||[],u=i.length,v={},s=2;u<64;s++)if(!v[s]){for(o=0;o<313;o+=s)v[o]=s;c[u]=f(s,.5)*h|0,i[u++]=f(s,1/3)*h|0}for(t+="";t.length%64-56;)t+="\0";for(o=0;o<t.length;o++){if((e=t.charCodeAt(o))>>8)return;l[o>>2]|=e<<(3-o)%4*8}for(l[l.length]=g/h|0,l[l.length]=g,e=0;e<l.length;){var k=l.slice(e,e+=16),d=c;for(c=c.slice(0,8),o=0;o<64;o++){var p=k[o-15],w=k[o-2],A=c[0],C=c[4],M=c[7]+(n(C,6)^n(C,11)^n(C,25))+(C&c[5]^~C&c[6])+i[o]+(k[o]=o<16?k[o]:k[o-16]+(n(p,7)^n(p,18)^p>>>3)+k[o-7]+(n(w,17)^n(w,19)^w>>>10)|0);(c=[M+((n(A,2)^n(A,13)^n(A,22))+(A&c[1]^A&c[2]^c[1]&c[2]))|0].concat(c))[4]=c[4]+M|0}for(o=0;o<8;o++)c[o]=c[o]+d[o]|0}for(o=0;o<8;o++)for(e=3;e+1;e--){var S=c[o]>>8*e&255;a+=(S<16?0:"")+S.toString(16)}return a};
/****************************SHA512/HMAC***************************************/
!function(){"use strict";var h="input is invalid type",t="object"==typeof window,i=t?window:{};i.JS_SHA512_NO_WINDOW&&(t=!1);var s=!t&&"object"==typeof self;!i.JS_SHA512_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node?i=global:s&&(i=self);var e=!i.JS_SHA512_NO_COMMON_JS&&"object"==typeof module&&module.exports,r="function"==typeof define&&define.amd,n=!i.JS_SHA512_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,o="0123456789abcdef".split(""),a=[-2147483648,8388608,32768,128],l=[24,16,8,0],f=[1116352408,3609767458,1899447441,602891725,3049323471,3964484399,3921009573,2173295548,961987163,4081628472,1508970993,3053834265,2453635748,2937671579,2870763221,3664609560,3624381080,2734883394,310598401,1164996542,607225278,1323610764,1426881987,3590304994,1925078388,4068182383,2162078206,991336113,2614888103,633803317,3248222580,3479774868,3835390401,2666613458,4022224774,944711139,264347078,2341262773,604807628,2007800933,770255983,1495990901,1249150122,1856431235,1555081692,3175218132,1996064986,2198950837,2554220882,3999719339,2821834349,766784016,2952996808,2566594879,3210313671,3203337956,3336571891,1034457026,3584528711,2466948901,113926993,3758326383,338241895,168717936,666307205,1188179964,773529912,1546045734,1294757372,1522805485,1396182291,2643833823,1695183700,2343527390,1986661051,1014477480,2177026350,1206759142,2456956037,344077627,2730485921,1290863460,2820302411,3158454273,3259730800,3505952657,3345764771,106217008,3516065817,3606008344,3600352804,1432725776,4094571909,1467031594,275423344,851169720,430227734,3100823752,506948616,1363258195,659060556,3750685593,883997877,3785050280,958139571,3318307427,1322822218,3812723403,1537002063,2003034995,1747873779,3602036899,1955562222,1575990012,2024104815,1125592928,2227730452,2716904306,2361852424,442776044,2428436474,593698344,2756734187,3733110249,3204031479,2999351573,3329325298,3815920427,3391569614,3928383900,3515267271,566280711,3940187606,3454069534,4118630271,4000239992,116418474,1914138554,174292421,2731055270,289380356,3203993006,460393269,320620315,685471733,587496836,852142971,1086792851,1017036298,365543100,1126000580,2618297676,1288033470,3409855158,1501505948,4234509866,1607167915,987167468,1816402316,1246189591],c=["hex","array","digest","arrayBuffer"],u=[];!i.JS_SHA512_NO_NODE_JS&&Array.isArray||(Array.isArray=function(h){return"[object Array]"===Object.prototype.toString.call(h)}),!n||!i.JS_SHA512_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(h){return"object"==typeof h&&h.buffer&&h.buffer.constructor===ArrayBuffer});var y=function(h,t){return function(i){return new w(t,!0).update(i)[h]()}},p=function(h){var t=y("hex",h);t.create=function(){return new w(h)},t.update=function(h){return t.create().update(h)};for(var i=0;i<c.length;++i){var s=c[i];t[s]=y(s,h)}return t},d=function(h,t){return function(i,s){return new A(i,t,!0).update(s)[h]()}},b=function(h){var t=d("hex",h);t.create=function(t){return new A(t,h)},t.update=function(h,i){return t.create(h).update(i)};for(var i=0;i<c.length;++i){var s=c[i];t[s]=d(s,h)}return t};function w(h,t){t?(u[0]=u[1]=u[2]=u[3]=u[4]=u[5]=u[6]=u[7]=u[8]=u[9]=u[10]=u[11]=u[12]=u[13]=u[14]=u[15]=u[16]=u[17]=u[18]=u[19]=u[20]=u[21]=u[22]=u[23]=u[24]=u[25]=u[26]=u[27]=u[28]=u[29]=u[30]=u[31]=u[32]=0,this.blocks=u):this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],384==h?(this.h0h=3418070365,this.h0l=3238371032,this.h1h=1654270250,this.h1l=914150663,this.h2h=2438529370,this.h2l=812702999,this.h3h=355462360,this.h3l=4144912697,this.h4h=1731405415,this.h4l=4290775857,this.h5h=2394180231,this.h5l=1750603025,this.h6h=3675008525,this.h6l=1694076839,this.h7h=1203062813,this.h7l=3204075428):256==h?(this.h0h=573645204,this.h0l=4230739756,this.h1h=2673172387,this.h1l=3360449730,this.h2h=596883563,this.h2l=1867755857,this.h3h=2520282905,this.h3l=1497426621,this.h4h=2519219938,this.h4l=2827943907,this.h5h=3193839141,this.h5l=1401305490,this.h6h=721525244,this.h6l=746961066,this.h7h=246885852,this.h7l=2177182882):224==h?(this.h0h=2352822216,this.h0l=424955298,this.h1h=1944164710,this.h1l=2312950998,this.h2h=502970286,this.h2l=855612546,this.h3h=1738396948,this.h3l=1479516111,this.h4h=258812777,this.h4l=2077511080,this.h5h=2011393907,this.h5l=79989058,this.h6h=1067287976,this.h6l=1780299464,this.h7h=286451373,this.h7l=2446758561):(this.h0h=1779033703,this.h0l=4089235720,this.h1h=3144134277,this.h1l=2227873595,this.h2h=1013904242,this.h2l=4271175723,this.h3h=2773480762,this.h3l=1595750129,this.h4h=1359893119,this.h4l=2917565137,this.h5h=2600822924,this.h5l=725511199,this.h6h=528734635,this.h6l=4215389547,this.h7h=1541459225,this.h7l=327033209),this.bits=h,this.block=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1}function A(t,i,s){var e,r=typeof t;if("string"!==r){if("object"!==r)throw new Error(h);if(null===t)throw new Error(h);if(n&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!(Array.isArray(t)||n&&ArrayBuffer.isView(t)))throw new Error(h);e=!0}var o=t.length;if(!e){for(var a,l=[],f=(o=t.length,0),c=0;c<o;++c)(a=t.charCodeAt(c))<128?l[f++]=a:a<2048?(l[f++]=192|a>>6,l[f++]=128|63&a):a<55296||a>=57344?(l[f++]=224|a>>12,l[f++]=128|a>>6&63,l[f++]=128|63&a):(a=65536+((1023&a)<<10|1023&t.charCodeAt(++c)),l[f++]=240|a>>18,l[f++]=128|a>>12&63,l[f++]=128|a>>6&63,l[f++]=128|63&a);t=l}t.length>128&&(t=new w(i,!0).update(t).array());var u=[],y=[];for(c=0;c<128;++c){var p=t[c]||0;u[c]=92^p,y[c]=54^p}w.call(this,i,s),this.update(y),this.oKeyPad=u,this.inner=!0,this.sharedMemory=s}w.prototype.update=function(t){if(this.finalized)throw new Error("finalize already called");var i,s=typeof t;if("string"!==s){if("object"!==s)throw new Error(h);if(null===t)throw new Error(h);if(n&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!(Array.isArray(t)||n&&ArrayBuffer.isView(t)))throw new Error(h);i=!0}for(var e,r,o=0,a=t.length,f=this.blocks;o<a;){if(this.hashed&&(this.hashed=!1,f[0]=this.block,f[1]=f[2]=f[3]=f[4]=f[5]=f[6]=f[7]=f[8]=f[9]=f[10]=f[11]=f[12]=f[13]=f[14]=f[15]=f[16]=f[17]=f[18]=f[19]=f[20]=f[21]=f[22]=f[23]=f[24]=f[25]=f[26]=f[27]=f[28]=f[29]=f[30]=f[31]=f[32]=0),i)for(r=this.start;o<a&&r<128;++o)f[r>>2]|=t[o]<<l[3&r++];else for(r=this.start;o<a&&r<128;++o)(e=t.charCodeAt(o))<128?f[r>>2]|=e<<l[3&r++]:e<2048?(f[r>>2]|=(192|e>>6)<<l[3&r++],f[r>>2]|=(128|63&e)<<l[3&r++]):e<55296||e>=57344?(f[r>>2]|=(224|e>>12)<<l[3&r++],f[r>>2]|=(128|e>>6&63)<<l[3&r++],f[r>>2]|=(128|63&e)<<l[3&r++]):(e=65536+((1023&e)<<10|1023&t.charCodeAt(++o)),f[r>>2]|=(240|e>>18)<<l[3&r++],f[r>>2]|=(128|e>>12&63)<<l[3&r++],f[r>>2]|=(128|e>>6&63)<<l[3&r++],f[r>>2]|=(128|63&e)<<l[3&r++]);this.lastByteIndex=r,this.bytes+=r-this.start,r>=128?(this.block=f[32],this.start=r-128,this.hash(),this.hashed=!0):this.start=r}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this},w.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var h=this.blocks,t=this.lastByteIndex;h[32]=this.block,h[t>>2]|=a[3&t],this.block=h[32],t>=112&&(this.hashed||this.hash(),h[0]=this.block,h[1]=h[2]=h[3]=h[4]=h[5]=h[6]=h[7]=h[8]=h[9]=h[10]=h[11]=h[12]=h[13]=h[14]=h[15]=h[16]=h[17]=h[18]=h[19]=h[20]=h[21]=h[22]=h[23]=h[24]=h[25]=h[26]=h[27]=h[28]=h[29]=h[30]=h[31]=h[32]=0),h[30]=this.hBytes<<3|this.bytes>>>29,h[31]=this.bytes<<3,this.hash()}},w.prototype.hash=function(){var h,t,i,s,e,r,n,o,a,l,c,u,y,p,d,b,w,A,_,v,B,U,S,g,k,z=this.h0h,E=this.h0l,O=this.h1h,m=this.h1l,x=this.h2h,N=this.h2l,j=this.h3h,J=this.h3l,H=this.h4h,I=this.h4l,R=this.h5h,V=this.h5l,C=this.h6h,K=this.h6l,P=this.h7h,D=this.h7l,F=this.blocks;for(h=32;h<160;h+=2)t=((v=F[h-30])>>>1|(B=F[h-29])<<31)^(v>>>8|B<<24)^v>>>7,i=(B>>>1|v<<31)^(B>>>8|v<<24)^(B>>>7|v<<25),s=((v=F[h-4])>>>19|(B=F[h-3])<<13)^(B>>>29|v<<3)^v>>>6,e=(B>>>19|v<<13)^(v>>>29|B<<3)^(B>>>6|v<<26),v=F[h-32],B=F[h-31],a=((U=F[h-14])>>>16)+(v>>>16)+(t>>>16)+(s>>>16)+((o=(65535&U)+(65535&v)+(65535&t)+(65535&s)+((n=((S=F[h-13])>>>16)+(B>>>16)+(i>>>16)+(e>>>16)+((r=(65535&S)+(65535&B)+(65535&i)+(65535&e))>>>16))>>>16))>>>16),F[h]=a<<16|65535&o,F[h+1]=n<<16|65535&r;var M=z,T=E,W=O,Y=m,q=x,G=N,L=j,Q=J,X=H,Z=I,$=R,hh=V,th=C,ih=K,sh=P,eh=D;for(b=W&q,w=Y&G,h=0;h<160;h+=8)t=(M>>>28|T<<4)^(T>>>2|M<<30)^(T>>>7|M<<25),i=(T>>>28|M<<4)^(M>>>2|T<<30)^(M>>>7|T<<25),s=(X>>>14|Z<<18)^(X>>>18|Z<<14)^(Z>>>9|X<<23),e=(Z>>>14|X<<18)^(Z>>>18|X<<14)^(X>>>9|Z<<23),A=(l=M&W)^M&q^b,_=(c=T&Y)^T&G^w,g=X&$^~X&th,k=Z&hh^~Z&ih,v=F[h],B=F[h+1],v=(a=((U=f[h])>>>16)+(v>>>16)+(g>>>16)+(s>>>16)+(sh>>>16)+((o=(65535&U)+(65535&v)+(65535&g)+(65535&s)+(65535&sh)+((n=((S=f[h+1])>>>16)+(B>>>16)+(k>>>16)+(e>>>16)+(eh>>>16)+((r=(65535&S)+(65535&B)+(65535&k)+(65535&e)+(65535&eh))>>>16))>>>16))>>>16))<<16|65535&o,B=n<<16|65535&r,U=(a=(A>>>16)+(t>>>16)+((o=(65535&A)+(65535&t)+((n=(_>>>16)+(i>>>16)+((r=(65535&_)+(65535&i))>>>16))>>>16))>>>16))<<16|65535&o,S=n<<16|65535&r,sh=(a=(L>>>16)+(v>>>16)+((o=(65535&L)+(65535&v)+((n=(Q>>>16)+(B>>>16)+((r=(65535&Q)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o,eh=n<<16|65535&r,t=((L=(a=(U>>>16)+(v>>>16)+((o=(65535&U)+(65535&v)+((n=(S>>>16)+(B>>>16)+((r=(65535&S)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o)>>>28|(Q=n<<16|65535&r)<<4)^(Q>>>2|L<<30)^(Q>>>7|L<<25),i=(Q>>>28|L<<4)^(L>>>2|Q<<30)^(L>>>7|Q<<25),s=(sh>>>14|eh<<18)^(sh>>>18|eh<<14)^(eh>>>9|sh<<23),e=(eh>>>14|sh<<18)^(eh>>>18|sh<<14)^(sh>>>9|eh<<23),A=(u=L&M)^L&W^l,_=(y=Q&T)^Q&Y^c,g=sh&X^~sh&$,k=eh&Z^~eh&hh,v=F[h+2],B=F[h+3],v=(a=((U=f[h+2])>>>16)+(v>>>16)+(g>>>16)+(s>>>16)+(th>>>16)+((o=(65535&U)+(65535&v)+(65535&g)+(65535&s)+(65535&th)+((n=((S=f[h+3])>>>16)+(B>>>16)+(k>>>16)+(e>>>16)+(ih>>>16)+((r=(65535&S)+(65535&B)+(65535&k)+(65535&e)+(65535&ih))>>>16))>>>16))>>>16))<<16|65535&o,B=n<<16|65535&r,U=(a=(A>>>16)+(t>>>16)+((o=(65535&A)+(65535&t)+((n=(_>>>16)+(i>>>16)+((r=(65535&_)+(65535&i))>>>16))>>>16))>>>16))<<16|65535&o,S=n<<16|65535&r,th=(a=(q>>>16)+(v>>>16)+((o=(65535&q)+(65535&v)+((n=(G>>>16)+(B>>>16)+((r=(65535&G)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o,ih=n<<16|65535&r,t=((q=(a=(U>>>16)+(v>>>16)+((o=(65535&U)+(65535&v)+((n=(S>>>16)+(B>>>16)+((r=(65535&S)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o)>>>28|(G=n<<16|65535&r)<<4)^(G>>>2|q<<30)^(G>>>7|q<<25),i=(G>>>28|q<<4)^(q>>>2|G<<30)^(q>>>7|G<<25),s=(th>>>14|ih<<18)^(th>>>18|ih<<14)^(ih>>>9|th<<23),e=(ih>>>14|th<<18)^(ih>>>18|th<<14)^(th>>>9|ih<<23),A=(p=q&L)^q&M^u,_=(d=G&Q)^G&T^y,g=th&sh^~th&X,k=ih&eh^~ih&Z,v=F[h+4],B=F[h+5],v=(a=((U=f[h+4])>>>16)+(v>>>16)+(g>>>16)+(s>>>16)+($>>>16)+((o=(65535&U)+(65535&v)+(65535&g)+(65535&s)+(65535&$)+((n=((S=f[h+5])>>>16)+(B>>>16)+(k>>>16)+(e>>>16)+(hh>>>16)+((r=(65535&S)+(65535&B)+(65535&k)+(65535&e)+(65535&hh))>>>16))>>>16))>>>16))<<16|65535&o,B=n<<16|65535&r,U=(a=(A>>>16)+(t>>>16)+((o=(65535&A)+(65535&t)+((n=(_>>>16)+(i>>>16)+((r=(65535&_)+(65535&i))>>>16))>>>16))>>>16))<<16|65535&o,S=n<<16|65535&r,$=(a=(W>>>16)+(v>>>16)+((o=(65535&W)+(65535&v)+((n=(Y>>>16)+(B>>>16)+((r=(65535&Y)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o,hh=n<<16|65535&r,t=((W=(a=(U>>>16)+(v>>>16)+((o=(65535&U)+(65535&v)+((n=(S>>>16)+(B>>>16)+((r=(65535&S)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o)>>>28|(Y=n<<16|65535&r)<<4)^(Y>>>2|W<<30)^(Y>>>7|W<<25),i=(Y>>>28|W<<4)^(W>>>2|Y<<30)^(W>>>7|Y<<25),s=($>>>14|hh<<18)^($>>>18|hh<<14)^(hh>>>9|$<<23),e=(hh>>>14|$<<18)^(hh>>>18|$<<14)^($>>>9|hh<<23),A=(b=W&q)^W&L^p,_=(w=Y&G)^Y&Q^d,g=$&th^~$&sh,k=hh&ih^~hh&eh,v=F[h+6],B=F[h+7],v=(a=((U=f[h+6])>>>16)+(v>>>16)+(g>>>16)+(s>>>16)+(X>>>16)+((o=(65535&U)+(65535&v)+(65535&g)+(65535&s)+(65535&X)+((n=((S=f[h+7])>>>16)+(B>>>16)+(k>>>16)+(e>>>16)+(Z>>>16)+((r=(65535&S)+(65535&B)+(65535&k)+(65535&e)+(65535&Z))>>>16))>>>16))>>>16))<<16|65535&o,B=n<<16|65535&r,U=(a=(A>>>16)+(t>>>16)+((o=(65535&A)+(65535&t)+((n=(_>>>16)+(i>>>16)+((r=(65535&_)+(65535&i))>>>16))>>>16))>>>16))<<16|65535&o,S=n<<16|65535&r,X=(a=(M>>>16)+(v>>>16)+((o=(65535&M)+(65535&v)+((n=(T>>>16)+(B>>>16)+((r=(65535&T)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o,Z=n<<16|65535&r,M=(a=(U>>>16)+(v>>>16)+((o=(65535&U)+(65535&v)+((n=(S>>>16)+(B>>>16)+((r=(65535&S)+(65535&B))>>>16))>>>16))>>>16))<<16|65535&o,T=n<<16|65535&r;a=(z>>>16)+(M>>>16)+((o=(65535&z)+(65535&M)+((n=(E>>>16)+(T>>>16)+((r=(65535&E)+(65535&T))>>>16))>>>16))>>>16),this.h0h=a<<16|65535&o,this.h0l=n<<16|65535&r,a=(O>>>16)+(W>>>16)+((o=(65535&O)+(65535&W)+((n=(m>>>16)+(Y>>>16)+((r=(65535&m)+(65535&Y))>>>16))>>>16))>>>16),this.h1h=a<<16|65535&o,this.h1l=n<<16|65535&r,a=(x>>>16)+(q>>>16)+((o=(65535&x)+(65535&q)+((n=(N>>>16)+(G>>>16)+((r=(65535&N)+(65535&G))>>>16))>>>16))>>>16),this.h2h=a<<16|65535&o,this.h2l=n<<16|65535&r,a=(j>>>16)+(L>>>16)+((o=(65535&j)+(65535&L)+((n=(J>>>16)+(Q>>>16)+((r=(65535&J)+(65535&Q))>>>16))>>>16))>>>16),this.h3h=a<<16|65535&o,this.h3l=n<<16|65535&r,a=(H>>>16)+(X>>>16)+((o=(65535&H)+(65535&X)+((n=(I>>>16)+(Z>>>16)+((r=(65535&I)+(65535&Z))>>>16))>>>16))>>>16),this.h4h=a<<16|65535&o,this.h4l=n<<16|65535&r,a=(R>>>16)+($>>>16)+((o=(65535&R)+(65535&$)+((n=(V>>>16)+(hh>>>16)+((r=(65535&V)+(65535&hh))>>>16))>>>16))>>>16),this.h5h=a<<16|65535&o,this.h5l=n<<16|65535&r,a=(C>>>16)+(th>>>16)+((o=(65535&C)+(65535&th)+((n=(K>>>16)+(ih>>>16)+((r=(65535&K)+(65535&ih))>>>16))>>>16))>>>16),this.h6h=a<<16|65535&o,this.h6l=n<<16|65535&r,a=(P>>>16)+(sh>>>16)+((o=(65535&P)+(65535&sh)+((n=(D>>>16)+(eh>>>16)+((r=(65535&D)+(65535&eh))>>>16))>>>16))>>>16),this.h7h=a<<16|65535&o,this.h7l=n<<16|65535&r},w.prototype.hex=function(){this.finalize();var h=this.h0h,t=this.h0l,i=this.h1h,s=this.h1l,e=this.h2h,r=this.h2l,n=this.h3h,a=this.h3l,l=this.h4h,f=this.h4l,c=this.h5h,u=this.h5l,y=this.h6h,p=this.h6l,d=this.h7h,b=this.h7l,w=this.bits,A=o[h>>28&15]+o[h>>24&15]+o[h>>20&15]+o[h>>16&15]+o[h>>12&15]+o[h>>8&15]+o[h>>4&15]+o[15&h]+o[t>>28&15]+o[t>>24&15]+o[t>>20&15]+o[t>>16&15]+o[t>>12&15]+o[t>>8&15]+o[t>>4&15]+o[15&t]+o[i>>28&15]+o[i>>24&15]+o[i>>20&15]+o[i>>16&15]+o[i>>12&15]+o[i>>8&15]+o[i>>4&15]+o[15&i]+o[s>>28&15]+o[s>>24&15]+o[s>>20&15]+o[s>>16&15]+o[s>>12&15]+o[s>>8&15]+o[s>>4&15]+o[15&s]+o[e>>28&15]+o[e>>24&15]+o[e>>20&15]+o[e>>16&15]+o[e>>12&15]+o[e>>8&15]+o[e>>4&15]+o[15&e]+o[r>>28&15]+o[r>>24&15]+o[r>>20&15]+o[r>>16&15]+o[r>>12&15]+o[r>>8&15]+o[r>>4&15]+o[15&r]+o[n>>28&15]+o[n>>24&15]+o[n>>20&15]+o[n>>16&15]+o[n>>12&15]+o[n>>8&15]+o[n>>4&15]+o[15&n];return w>=256&&(A+=o[a>>28&15]+o[a>>24&15]+o[a>>20&15]+o[a>>16&15]+o[a>>12&15]+o[a>>8&15]+o[a>>4&15]+o[15&a]),w>=384&&(A+=o[l>>28&15]+o[l>>24&15]+o[l>>20&15]+o[l>>16&15]+o[l>>12&15]+o[l>>8&15]+o[l>>4&15]+o[15&l]+o[f>>28&15]+o[f>>24&15]+o[f>>20&15]+o[f>>16&15]+o[f>>12&15]+o[f>>8&15]+o[f>>4&15]+o[15&f]+o[c>>28&15]+o[c>>24&15]+o[c>>20&15]+o[c>>16&15]+o[c>>12&15]+o[c>>8&15]+o[c>>4&15]+o[15&c]+o[u>>28&15]+o[u>>24&15]+o[u>>20&15]+o[u>>16&15]+o[u>>12&15]+o[u>>8&15]+o[u>>4&15]+o[15&u]),512==w&&(A+=o[y>>28&15]+o[y>>24&15]+o[y>>20&15]+o[y>>16&15]+o[y>>12&15]+o[y>>8&15]+o[y>>4&15]+o[15&y]+o[p>>28&15]+o[p>>24&15]+o[p>>20&15]+o[p>>16&15]+o[p>>12&15]+o[p>>8&15]+o[p>>4&15]+o[15&p]+o[d>>28&15]+o[d>>24&15]+o[d>>20&15]+o[d>>16&15]+o[d>>12&15]+o[d>>8&15]+o[d>>4&15]+o[15&d]+o[b>>28&15]+o[b>>24&15]+o[b>>20&15]+o[b>>16&15]+o[b>>12&15]+o[b>>8&15]+o[b>>4&15]+o[15&b]),A},w.prototype.toString=w.prototype.hex,w.prototype.digest=function(){this.finalize();var h=this.h0h,t=this.h0l,i=this.h1h,s=this.h1l,e=this.h2h,r=this.h2l,n=this.h3h,o=this.h3l,a=this.h4h,l=this.h4l,f=this.h5h,c=this.h5l,u=this.h6h,y=this.h6l,p=this.h7h,d=this.h7l,b=this.bits,w=[h>>24&255,h>>16&255,h>>8&255,255&h,t>>24&255,t>>16&255,t>>8&255,255&t,i>>24&255,i>>16&255,i>>8&255,255&i,s>>24&255,s>>16&255,s>>8&255,255&s,e>>24&255,e>>16&255,e>>8&255,255&e,r>>24&255,r>>16&255,r>>8&255,255&r,n>>24&255,n>>16&255,n>>8&255,255&n];return b>=256&&w.push(o>>24&255,o>>16&255,o>>8&255,255&o),b>=384&&w.push(a>>24&255,a>>16&255,a>>8&255,255&a,l>>24&255,l>>16&255,l>>8&255,255&l,f>>24&255,f>>16&255,f>>8&255,255&f,c>>24&255,c>>16&255,c>>8&255,255&c),512==b&&w.push(u>>24&255,u>>16&255,u>>8&255,255&u,y>>24&255,y>>16&255,y>>8&255,255&y,p>>24&255,p>>16&255,p>>8&255,255&p,d>>24&255,d>>16&255,d>>8&255,255&d),w},w.prototype.array=w.prototype.digest,w.prototype.arrayBuffer=function(){this.finalize();var h=this.bits,t=new ArrayBuffer(h/8),i=new DataView(t);return i.setUint32(0,this.h0h),i.setUint32(4,this.h0l),i.setUint32(8,this.h1h),i.setUint32(12,this.h1l),i.setUint32(16,this.h2h),i.setUint32(20,this.h2l),i.setUint32(24,this.h3h),h>=256&&i.setUint32(28,this.h3l),h>=384&&(i.setUint32(32,this.h4h),i.setUint32(36,this.h4l),i.setUint32(40,this.h5h),i.setUint32(44,this.h5l)),512==h&&(i.setUint32(48,this.h6h),i.setUint32(52,this.h6l),i.setUint32(56,this.h7h),i.setUint32(60,this.h7l)),t},w.prototype.clone=function(){var h=new w(this.bits,!1);return this.copyTo(h),h},w.prototype.copyTo=function(h){var t=0,i=["h0h","h0l","h1h","h1l","h2h","h2l","h3h","h3l","h4h","h4l","h5h","h5l","h6h","h6l","h7h","h7l","start","bytes","hBytes","finalized","hashed","lastByteIndex"];for(t=0;t<i.length;++t)h[i[t]]=this[i[t]];for(t=0;t<this.blocks.length;++t)h.blocks[t]=this.blocks[t]},A.prototype=new w,A.prototype.finalize=function(){if(w.prototype.finalize.call(this),this.inner){this.inner=!1;var h=this.array();w.call(this,this.bits,this.sharedMemory),this.update(this.oKeyPad),this.update(h),w.prototype.finalize.call(this)}},A.prototype.clone=function(){var h=new A([],this.bits,!1);this.copyTo(h),h.inner=this.inner;for(var t=0;t<this.oKeyPad.length;++t)h.oKeyPad[t]=this.oKeyPad[t];return h};var _=p(512);_.sha512=_,_.sha384=p(384),_.sha512_256=p(256),_.sha512_224=p(224),_.sha512.hmac=b(512),_.sha384.hmac=b(384),_.sha512_256.hmac=b(256),_.sha512_224.hmac=b(224),e?module.exports=_:(i.sha512=_.sha512,i.sha384=_.sha384,i.sha512_256=_.sha512_256,i.sha512_224=_.sha512_224,r&&define(function(){return _}))}();
/****************************MD2************************************************/
!function(){"use strict";var o="object"==typeof window?window:{};!o.JS_MD2_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node&&(o=global);var e=!o.JS_MD2_NO_COMMON_JS&&"object"==typeof module&&module.exports,r="function"==typeof define&&define.amd,f="0123456789abcdef".split(""),t=[41,46,67,201,162,216,124,1,61,54,84,161,236,240,6,19,98,167,5,243,192,199,115,140,152,147,43,217,188,76,130,202,30,155,87,60,253,212,224,22,103,66,111,24,138,23,229,18,190,78,196,214,218,158,222,73,160,251,245,142,187,47,238,122,169,104,121,145,21,178,7,63,148,194,16,137,11,34,95,33,128,127,93,154,90,144,50,39,53,62,204,231,191,247,151,3,255,25,48,179,72,165,181,209,215,94,146,42,172,86,170,198,79,184,56,210,150,164,125,182,118,252,107,226,156,116,4,241,69,157,112,89,100,113,135,32,134,91,207,101,230,45,168,2,27,96,37,173,174,176,185,246,28,70,97,105,52,64,126,15,85,71,163,35,221,81,175,58,195,92,249,206,186,197,234,38,44,83,13,110,133,40,132,9,211,223,205,244,65,129,77,82,106,220,55,200,108,193,171,250,36,225,123,8,12,189,177,74,120,136,149,139,227,99,232,109,233,203,213,254,59,0,29,57,242,239,183,14,102,88,208,228,166,119,114,248,235,117,75,10,49,68,80,180,143,237,31,26,219,153,141,51,159,17,131,20],n=[],d=[],i=[],s=function(o){var e,r,s,c,p,u,a=0,l=1,_=0,v=0,b=0,m=o.length;for(r=0;r<16;++r)d[r]=i[r]=0;n[16]=n[17]=n[18]=0;do{for(n[0]=n[16],n[1]=n[17],n[2]=n[18],n[16]=n[17]=n[18]=n[3]=n[4]=n[5]=n[6]=n[7]=n[8]=n[9]=n[10]=n[11]=n[12]=n[13]=n[14]=n[15]=0,r=v;_<m&&r<16;++_)(e=o.charCodeAt(_))<128?n[r++]=e:e<2048?(n[r++]=192|e>>6,n[r++]=128|63&e):e<55296||e>=57344?(n[r++]=224|e>>12,n[r++]=128|e>>6&63,n[r++]=128|63&e):(e=65536+((1023&e)<<10|1023&o.charCodeAt(++_)),n[r++]=240|e>>18,n[r++]=128|e>>12&63,n[r++]=128|e>>6&63,n[r++]=128|63&e);if(b+=r-v,v=r-16,_===m&&r<16)for(l=2,p=16-(15&b);r<16;++r)n[r]=p;for(r=0;r<16;++r)i[r]^=t[n[r]^a],a=i[r];for(r=0;r<l;++r)for(u=0===r?n:i,d[16]=u[0],d[32]=d[16]^d[0],d[17]=u[1],d[33]=d[17]^d[1],d[18]=u[2],d[34]=d[18]^d[2],d[19]=u[3],d[35]=d[19]^d[3],d[20]=u[4],d[36]=d[20]^d[4],d[21]=u[5],d[37]=d[21]^d[5],d[22]=u[6],d[38]=d[22]^d[6],d[23]=u[7],d[39]=d[23]^d[7],d[24]=u[8],d[40]=d[24]^d[8],d[25]=u[9],d[41]=d[25]^d[9],d[26]=u[10],d[42]=d[26]^d[10],d[27]=u[11],d[43]=d[27]^d[11],d[28]=u[12],d[44]=d[28]^d[12],d[29]=u[13],d[45]=d[29]^d[13],d[30]=u[14],d[46]=d[30]^d[14],d[31]=u[15],d[47]=d[31]^d[15],p=0,s=0;s<18;++s){for(c=0;c<48;++c)d[c]=p=d[c]^t[p];p=p+s&255}}while(1===l);var w="";for(r=0;r<16;++r)w+=f[d[r]>>4&15]+f[15&d[r]];return w};e?module.exports=s:(o.md2=s,r&&define(function(){return s}))}();
/****************************MD4************************************************/
!function(){"use strict";var t="object"==typeof window?window:{},e=!t.JS_MD4_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;e&&(t=global);var i,r=!t.JS_MD4_NO_COMMON_JS&&"object"==typeof module&&module.exports,h="function"==typeof define&&define.amd,s=!t.JS_MD4_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,n="0123456789abcdef".split(""),f=[128,32768,8388608,-2147483648],a=[0,8,16,24],o=["hex","array","digest","buffer","arrayBuffer"],u=[];if(s){var p=new ArrayBuffer(68);i=new Uint8Array(p),u=new Uint32Array(p)}var d=function(t){return function(e){return new c(!0).update(e)[t]()}},y=function(t){var e=require("crypto"),i=require("buffer").Buffer;return function(r){if("string"==typeof r)return e.createHash("md4").update(r,"utf8").digest("hex");if(s&&r instanceof ArrayBuffer)r=new Uint8Array(r);else if(void 0===r.length)return t(r);return e.createHash("md4").update(new i(r)).digest("hex")}};function c(t){if(t)u[0]=u[16]=u[1]=u[2]=u[3]=u[4]=u[5]=u[6]=u[7]=u[8]=u[9]=u[10]=u[11]=u[12]=u[13]=u[14]=u[15]=0,this.blocks=u,this.buffer8=i;else if(s){var e=new ArrayBuffer(68);this.buffer8=new Uint8Array(e),this.blocks=new Uint32Array(e)}else this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.h0=this.h1=this.h2=this.h3=this.start=this.bytes=0,this.finalized=this.hashed=!1,this.first=!0}c.prototype.update=function(t){if(!this.finalized){var e="string"!=typeof t;e&&s&&t instanceof ArrayBuffer&&(t=new Uint8Array(t));for(var i,r,h=0,n=t.length||0,f=this.blocks,o=this.buffer8;h<n;){if(this.hashed&&(this.hashed=!1,f[0]=f[16],f[16]=f[1]=f[2]=f[3]=f[4]=f[5]=f[6]=f[7]=f[8]=f[9]=f[10]=f[11]=f[12]=f[13]=f[14]=f[15]=0),e)if(s)for(r=this.start;h<n&&r<64;++h)o[r++]=t[h];else for(r=this.start;h<n&&r<64;++h)f[r>>2]|=t[h]<<a[3&r++];else if(s)for(r=this.start;h<n&&r<64;++h)(i=t.charCodeAt(h))<128?o[r++]=i:i<2048?(o[r++]=192|i>>6,o[r++]=128|63&i):i<55296||i>=57344?(o[r++]=224|i>>12,o[r++]=128|i>>6&63,o[r++]=128|63&i):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++h)),o[r++]=240|i>>18,o[r++]=128|i>>12&63,o[r++]=128|i>>6&63,o[r++]=128|63&i);else for(r=this.start;h<n&&r<64;++h)(i=t.charCodeAt(h))<128?f[r>>2]|=i<<a[3&r++]:i<2048?(f[r>>2]|=(192|i>>6)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]):i<55296||i>=57344?(f[r>>2]|=(224|i>>12)<<a[3&r++],f[r>>2]|=(128|i>>6&63)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++h)),f[r>>2]|=(240|i>>18)<<a[3&r++],f[r>>2]|=(128|i>>12&63)<<a[3&r++],f[r>>2]|=(128|i>>6&63)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]);this.lastByteIndex=r,this.bytes+=r-this.start,r>=64?(this.start=r-64,this.hash(),this.hashed=!0):this.start=r}return this}},c.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,e=this.lastByteIndex;t[e>>2]|=f[3&e],e>=56&&(this.hashed||this.hash(),t[0]=t[16],t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.bytes<<3,this.hash()}},c.prototype.hash=function(){var t,e,i,r,h,s,n,f,a=this.blocks;this.first?e=(e=((i=(i=((r=(r=(4023233417&(t=(t=a[0]-1)<<3|t>>>29)|2562383102&~t)+a[1]+271733878)<<7|r>>>25)&t|4023233417&~r)+a[2]-1732584194)<<11|i>>>21)&r|~i&t)+a[3]-271733879)<<19|e>>>13:(t=this.h0,e=this.h1,i=this.h2,r=this.h3,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[0])<<3|t>>>29)&e|~t&i)+a[1])<<7|r>>>25)&t|~r&e)+a[2])<<11|i>>>21)&r|~i&t)+a[3])<<19|e>>>13),e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[4])<<3|t>>>29)&e|~t&i)+a[5])<<7|r>>>25)&t|~r&e)+a[6])<<11|i>>>21)&r|~i&t)+a[7])<<19|e>>>13,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[8])<<3|t>>>29)&e|~t&i)+a[9])<<7|r>>>25)&t|~r&e)+a[10])<<11|i>>>21)&r|~i&t)+a[11])<<19|e>>>13,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[12])<<3|t>>>29)&e|~t&i)+a[13])<<7|r>>>25)&t|~r&e)+a[14])<<11|i>>>21)&r|~i&t)+a[15])<<19|e>>>13,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|i&r)+a[0]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[4]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[8]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[12]+1518500249)<<13|e>>>19,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[1]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[5]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[9]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[13]+1518500249)<<13|e>>>19,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[2]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[6]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[10]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[14]+1518500249)<<13|e>>>19,e=(e+=((i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[3]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[7]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[11]+1518500249)<<9|i>>>23)&r|i&t|f)+a[15]+1518500249)<<13|e>>>19,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[0]+1859775393)<<3|t>>>29))+a[8]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[4]+1859775393)<<11|i>>>21))+a[12]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[2]+1859775393)<<3|t>>>29))+a[10]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[6]+1859775393)<<11|i>>>21))+a[14]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[1]+1859775393)<<3|t>>>29))+a[9]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[5]+1859775393)<<11|i>>>21))+a[13]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[3]+1859775393)<<3|t>>>29))+a[11]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[7]+1859775393)<<11|i>>>21))+a[15]+1859775393)<<15|e>>>17,this.first?(this.h0=t+1732584193<<0,this.h1=e-271733879<<0,this.h2=i-1732584194<<0,this.h3=r+271733878<<0,this.first=!1):(this.h0=this.h0+t<<0,this.h1=this.h1+e<<0,this.h2=this.h2+i<<0,this.h3=this.h3+r<<0)},c.prototype.hex=function(){this.finalize();var t=this.h0,e=this.h1,i=this.h2,r=this.h3;return n[t>>4&15]+n[15&t]+n[t>>12&15]+n[t>>8&15]+n[t>>20&15]+n[t>>16&15]+n[t>>28&15]+n[t>>24&15]+n[e>>4&15]+n[15&e]+n[e>>12&15]+n[e>>8&15]+n[e>>20&15]+n[e>>16&15]+n[e>>28&15]+n[e>>24&15]+n[i>>4&15]+n[15&i]+n[i>>12&15]+n[i>>8&15]+n[i>>20&15]+n[i>>16&15]+n[i>>28&15]+n[i>>24&15]+n[r>>4&15]+n[15&r]+n[r>>12&15]+n[r>>8&15]+n[r>>20&15]+n[r>>16&15]+n[r>>28&15]+n[r>>24&15]},c.prototype.toString=c.prototype.hex,c.prototype.digest=function(){this.finalize();var t=this.h0,e=this.h1,i=this.h2,r=this.h3;return[255&t,t>>8&255,t>>16&255,t>>24&255,255&e,e>>8&255,e>>16&255,e>>24&255,255&i,i>>8&255,i>>16&255,i>>24&255,255&r,r>>8&255,r>>16&255,r>>24&255]},c.prototype.array=c.prototype.digest,c.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(16),e=new Uint32Array(t);return e[0]=this.h0,e[1]=this.h1,e[2]=this.h2,e[3]=this.h3,t},c.prototype.buffer=c.prototype.arrayBuffer;var l=function(){var t=d("hex");e&&(t=y(t)),t.create=function(){return new c},t.update=function(e){return t.create().update(e)};for(var i=0;i<o.length;++i){var r=o[i];t[r]=d(r)}return t}();r?module.exports=l:(t.md4=l,h&&define(function(){return l}))}();
/****************************CryptoJS AES***************************************/
!function(){var e=CryptoJS,r=e.lib.BlockCipher,t=e.algo,i=[],o=[],s=[],n=[],c=[],h=[],y=[],_=[],a=[],d=[];!function(){for(var e=[],r=0;r<256;r++)e[r]=r<128?r<<1:r<<1^283;var t=0,l=0;for(r=0;r<256;r++){var v=l^l<<1^l<<2^l<<3^l<<4;v=v>>>8^255&v^99,i[t]=v,o[v]=t;var f=e[t],k=e[f],u=e[k],p=257*e[v]^16843008*v;s[t]=p<<24|p>>>8,n[t]=p<<16|p>>>16,c[t]=p<<8|p>>>24,h[t]=p;p=16843009*u^65537*k^257*f^16843008*t;y[v]=p<<24|p>>>8,_[v]=p<<16|p>>>16,a[v]=p<<8|p>>>24,d[v]=p,t?(t=f^e[e[e[u^f]]],l^=e[e[l]]):t=l=1}}();var l=[0,1,2,4,8,16,32,64,128,27,54],v=t.AES=r.extend({_doReset:function(){if(!this._nRounds||this._keyPriorReset!==this._key){for(var e=this._keyPriorReset=this._key,r=e.words,t=e.sigBytes/4,o=4*((this._nRounds=t+6)+1),s=this._keySchedule=[],n=0;n<o;n++)n<t?s[n]=r[n]:(v=s[n-1],n%t?t>6&&n%t==4&&(v=i[v>>>24]<<24|i[v>>>16&255]<<16|i[v>>>8&255]<<8|i[255&v]):(v=i[(v=v<<8|v>>>24)>>>24]<<24|i[v>>>16&255]<<16|i[v>>>8&255]<<8|i[255&v],v^=l[n/t|0]<<24),s[n]=s[n-t]^v);for(var c=this._invKeySchedule=[],h=0;h<o;h++){n=o-h;if(h%4)var v=s[n];else v=s[n-4];c[h]=h<4||n<=4?v:y[i[v>>>24]]^_[i[v>>>16&255]]^a[i[v>>>8&255]]^d[i[255&v]]}}},encryptBlock:function(e,r){this._doCryptBlock(e,r,this._keySchedule,s,n,c,h,i)},decryptBlock:function(e,r){var t=e[r+1];e[r+1]=e[r+3],e[r+3]=t,this._doCryptBlock(e,r,this._invKeySchedule,y,_,a,d,o);t=e[r+1];e[r+1]=e[r+3],e[r+3]=t},_doCryptBlock:function(e,r,t,i,o,s,n,c){for(var h=this._nRounds,y=e[r]^t[0],_=e[r+1]^t[1],a=e[r+2]^t[2],d=e[r+3]^t[3],l=4,v=1;v<h;v++){var f=i[y>>>24]^o[_>>>16&255]^s[a>>>8&255]^n[255&d]^t[l++],k=i[_>>>24]^o[a>>>16&255]^s[d>>>8&255]^n[255&y]^t[l++],u=i[a>>>24]^o[d>>>16&255]^s[y>>>8&255]^n[255&_]^t[l++],p=i[d>>>24]^o[y>>>16&255]^s[_>>>8&255]^n[255&a]^t[l++];y=f,_=k,a=u,d=p}f=(c[y>>>24]<<24|c[_>>>16&255]<<16|c[a>>>8&255]<<8|c[255&d])^t[l++],k=(c[_>>>24]<<24|c[a>>>16&255]<<16|c[d>>>8&255]<<8|c[255&y])^t[l++],u=(c[a>>>24]<<24|c[d>>>16&255]<<16|c[y>>>8&255]<<8|c[255&_])^t[l++],p=(c[d>>>24]<<24|c[y>>>16&255]<<16|c[_>>>8&255]<<8|c[255&a])^t[l++];e[r]=f,e[r+1]=k,e[r+2]=u,e[r+3]=p},keySize:8});e.AES=r._createHelper(v)}();

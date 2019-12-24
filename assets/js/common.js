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
/****************************MD2************************************************/
!function(){"use strict";var o="object"==typeof window?window:{};!o.JS_MD2_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node&&(o=global);var e=!o.JS_MD2_NO_COMMON_JS&&"object"==typeof module&&module.exports,r="function"==typeof define&&define.amd,f="0123456789abcdef".split(""),t=[41,46,67,201,162,216,124,1,61,54,84,161,236,240,6,19,98,167,5,243,192,199,115,140,152,147,43,217,188,76,130,202,30,155,87,60,253,212,224,22,103,66,111,24,138,23,229,18,190,78,196,214,218,158,222,73,160,251,245,142,187,47,238,122,169,104,121,145,21,178,7,63,148,194,16,137,11,34,95,33,128,127,93,154,90,144,50,39,53,62,204,231,191,247,151,3,255,25,48,179,72,165,181,209,215,94,146,42,172,86,170,198,79,184,56,210,150,164,125,182,118,252,107,226,156,116,4,241,69,157,112,89,100,113,135,32,134,91,207,101,230,45,168,2,27,96,37,173,174,176,185,246,28,70,97,105,52,64,126,15,85,71,163,35,221,81,175,58,195,92,249,206,186,197,234,38,44,83,13,110,133,40,132,9,211,223,205,244,65,129,77,82,106,220,55,200,108,193,171,250,36,225,123,8,12,189,177,74,120,136,149,139,227,99,232,109,233,203,213,254,59,0,29,57,242,239,183,14,102,88,208,228,166,119,114,248,235,117,75,10,49,68,80,180,143,237,31,26,219,153,141,51,159,17,131,20],n=[],d=[],i=[],s=function(o){var e,r,s,c,p,u,a=0,l=1,_=0,v=0,b=0,m=o.length;for(r=0;r<16;++r)d[r]=i[r]=0;n[16]=n[17]=n[18]=0;do{for(n[0]=n[16],n[1]=n[17],n[2]=n[18],n[16]=n[17]=n[18]=n[3]=n[4]=n[5]=n[6]=n[7]=n[8]=n[9]=n[10]=n[11]=n[12]=n[13]=n[14]=n[15]=0,r=v;_<m&&r<16;++_)(e=o.charCodeAt(_))<128?n[r++]=e:e<2048?(n[r++]=192|e>>6,n[r++]=128|63&e):e<55296||e>=57344?(n[r++]=224|e>>12,n[r++]=128|e>>6&63,n[r++]=128|63&e):(e=65536+((1023&e)<<10|1023&o.charCodeAt(++_)),n[r++]=240|e>>18,n[r++]=128|e>>12&63,n[r++]=128|e>>6&63,n[r++]=128|63&e);if(b+=r-v,v=r-16,_===m&&r<16)for(l=2,p=16-(15&b);r<16;++r)n[r]=p;for(r=0;r<16;++r)i[r]^=t[n[r]^a],a=i[r];for(r=0;r<l;++r)for(u=0===r?n:i,d[16]=u[0],d[32]=d[16]^d[0],d[17]=u[1],d[33]=d[17]^d[1],d[18]=u[2],d[34]=d[18]^d[2],d[19]=u[3],d[35]=d[19]^d[3],d[20]=u[4],d[36]=d[20]^d[4],d[21]=u[5],d[37]=d[21]^d[5],d[22]=u[6],d[38]=d[22]^d[6],d[23]=u[7],d[39]=d[23]^d[7],d[24]=u[8],d[40]=d[24]^d[8],d[25]=u[9],d[41]=d[25]^d[9],d[26]=u[10],d[42]=d[26]^d[10],d[27]=u[11],d[43]=d[27]^d[11],d[28]=u[12],d[44]=d[28]^d[12],d[29]=u[13],d[45]=d[29]^d[13],d[30]=u[14],d[46]=d[30]^d[14],d[31]=u[15],d[47]=d[31]^d[15],p=0,s=0;s<18;++s){for(c=0;c<48;++c)d[c]=p=d[c]^t[p];p=p+s&255}}while(1===l);var w="";for(r=0;r<16;++r)w+=f[d[r]>>4&15]+f[15&d[r]];return w};e?module.exports=s:(o.md2=s,r&&define(function(){return s}))}();
/****************************MD4************************************************/
!function(){"use strict";var t="object"==typeof window?window:{},e=!t.JS_MD4_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;e&&(t=global);var i,r=!t.JS_MD4_NO_COMMON_JS&&"object"==typeof module&&module.exports,h="function"==typeof define&&define.amd,s=!t.JS_MD4_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,n="0123456789abcdef".split(""),f=[128,32768,8388608,-2147483648],a=[0,8,16,24],o=["hex","array","digest","buffer","arrayBuffer"],u=[];if(s){var p=new ArrayBuffer(68);i=new Uint8Array(p),u=new Uint32Array(p)}var d=function(t){return function(e){return new c(!0).update(e)[t]()}},y=function(t){var e=require("crypto"),i=require("buffer").Buffer;return function(r){if("string"==typeof r)return e.createHash("md4").update(r,"utf8").digest("hex");if(s&&r instanceof ArrayBuffer)r=new Uint8Array(r);else if(void 0===r.length)return t(r);return e.createHash("md4").update(new i(r)).digest("hex")}};function c(t){if(t)u[0]=u[16]=u[1]=u[2]=u[3]=u[4]=u[5]=u[6]=u[7]=u[8]=u[9]=u[10]=u[11]=u[12]=u[13]=u[14]=u[15]=0,this.blocks=u,this.buffer8=i;else if(s){var e=new ArrayBuffer(68);this.buffer8=new Uint8Array(e),this.blocks=new Uint32Array(e)}else this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.h0=this.h1=this.h2=this.h3=this.start=this.bytes=0,this.finalized=this.hashed=!1,this.first=!0}c.prototype.update=function(t){if(!this.finalized){var e="string"!=typeof t;e&&s&&t instanceof ArrayBuffer&&(t=new Uint8Array(t));for(var i,r,h=0,n=t.length||0,f=this.blocks,o=this.buffer8;h<n;){if(this.hashed&&(this.hashed=!1,f[0]=f[16],f[16]=f[1]=f[2]=f[3]=f[4]=f[5]=f[6]=f[7]=f[8]=f[9]=f[10]=f[11]=f[12]=f[13]=f[14]=f[15]=0),e)if(s)for(r=this.start;h<n&&r<64;++h)o[r++]=t[h];else for(r=this.start;h<n&&r<64;++h)f[r>>2]|=t[h]<<a[3&r++];else if(s)for(r=this.start;h<n&&r<64;++h)(i=t.charCodeAt(h))<128?o[r++]=i:i<2048?(o[r++]=192|i>>6,o[r++]=128|63&i):i<55296||i>=57344?(o[r++]=224|i>>12,o[r++]=128|i>>6&63,o[r++]=128|63&i):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++h)),o[r++]=240|i>>18,o[r++]=128|i>>12&63,o[r++]=128|i>>6&63,o[r++]=128|63&i);else for(r=this.start;h<n&&r<64;++h)(i=t.charCodeAt(h))<128?f[r>>2]|=i<<a[3&r++]:i<2048?(f[r>>2]|=(192|i>>6)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]):i<55296||i>=57344?(f[r>>2]|=(224|i>>12)<<a[3&r++],f[r>>2]|=(128|i>>6&63)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++h)),f[r>>2]|=(240|i>>18)<<a[3&r++],f[r>>2]|=(128|i>>12&63)<<a[3&r++],f[r>>2]|=(128|i>>6&63)<<a[3&r++],f[r>>2]|=(128|63&i)<<a[3&r++]);this.lastByteIndex=r,this.bytes+=r-this.start,r>=64?(this.start=r-64,this.hash(),this.hashed=!0):this.start=r}return this}},c.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,e=this.lastByteIndex;t[e>>2]|=f[3&e],e>=56&&(this.hashed||this.hash(),t[0]=t[16],t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.bytes<<3,this.hash()}},c.prototype.hash=function(){var t,e,i,r,h,s,n,f,a=this.blocks;this.first?e=(e=((i=(i=((r=(r=(4023233417&(t=(t=a[0]-1)<<3|t>>>29)|2562383102&~t)+a[1]+271733878)<<7|r>>>25)&t|4023233417&~r)+a[2]-1732584194)<<11|i>>>21)&r|~i&t)+a[3]-271733879)<<19|e>>>13:(t=this.h0,e=this.h1,i=this.h2,r=this.h3,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[0])<<3|t>>>29)&e|~t&i)+a[1])<<7|r>>>25)&t|~r&e)+a[2])<<11|i>>>21)&r|~i&t)+a[3])<<19|e>>>13),e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[4])<<3|t>>>29)&e|~t&i)+a[5])<<7|r>>>25)&t|~r&e)+a[6])<<11|i>>>21)&r|~i&t)+a[7])<<19|e>>>13,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[8])<<3|t>>>29)&e|~t&i)+a[9])<<7|r>>>25)&t|~r&e)+a[10])<<11|i>>>21)&r|~i&t)+a[11])<<19|e>>>13,e=(e+=((i=(i+=((r=(r+=((t=(t+=(e&i|~e&r)+a[12])<<3|t>>>29)&e|~t&i)+a[13])<<7|r>>>25)&t|~r&e)+a[14])<<11|i>>>21)&r|~i&t)+a[15])<<19|e>>>13,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|i&r)+a[0]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[4]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[8]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[12]+1518500249)<<13|e>>>19,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[1]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[5]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[9]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[13]+1518500249)<<13|e>>>19,e=(e+=((n=(i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[2]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[6]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[10]+1518500249)<<9|i>>>23)&r)|i&t|f)+a[14]+1518500249)<<13|e>>>19,e=(e+=((i=(i+=((f=(r=(r+=((h=(t=(t+=((s=e&i)|e&r|n)+a[3]+1518500249)<<3|t>>>29)&e)|t&i|s)+a[7]+1518500249)<<5|r>>>27)&t)|r&e|h)+a[11]+1518500249)<<9|i>>>23)&r|i&t|f)+a[15]+1518500249)<<13|e>>>19,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[0]+1859775393)<<3|t>>>29))+a[8]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[4]+1859775393)<<11|i>>>21))+a[12]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[2]+1859775393)<<3|t>>>29))+a[10]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[6]+1859775393)<<11|i>>>21))+a[14]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[1]+1859775393)<<3|t>>>29))+a[9]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[5]+1859775393)<<11|i>>>21))+a[13]+1859775393)<<15|e>>>17,e=(e+=((f=(r=(r+=((s=e^i)^(t=(t+=(s^r)+a[3]+1859775393)<<3|t>>>29))+a[11]+1859775393)<<9|r>>>23)^t)^(i=(i+=(f^e)+a[7]+1859775393)<<11|i>>>21))+a[15]+1859775393)<<15|e>>>17,this.first?(this.h0=t+1732584193<<0,this.h1=e-271733879<<0,this.h2=i-1732584194<<0,this.h3=r+271733878<<0,this.first=!1):(this.h0=this.h0+t<<0,this.h1=this.h1+e<<0,this.h2=this.h2+i<<0,this.h3=this.h3+r<<0)},c.prototype.hex=function(){this.finalize();var t=this.h0,e=this.h1,i=this.h2,r=this.h3;return n[t>>4&15]+n[15&t]+n[t>>12&15]+n[t>>8&15]+n[t>>20&15]+n[t>>16&15]+n[t>>28&15]+n[t>>24&15]+n[e>>4&15]+n[15&e]+n[e>>12&15]+n[e>>8&15]+n[e>>20&15]+n[e>>16&15]+n[e>>28&15]+n[e>>24&15]+n[i>>4&15]+n[15&i]+n[i>>12&15]+n[i>>8&15]+n[i>>20&15]+n[i>>16&15]+n[i>>28&15]+n[i>>24&15]+n[r>>4&15]+n[15&r]+n[r>>12&15]+n[r>>8&15]+n[r>>20&15]+n[r>>16&15]+n[r>>28&15]+n[r>>24&15]},c.prototype.toString=c.prototype.hex,c.prototype.digest=function(){this.finalize();var t=this.h0,e=this.h1,i=this.h2,r=this.h3;return[255&t,t>>8&255,t>>16&255,t>>24&255,255&e,e>>8&255,e>>16&255,e>>24&255,255&i,i>>8&255,i>>16&255,i>>24&255,255&r,r>>8&255,r>>16&255,r>>24&255]},c.prototype.array=c.prototype.digest,c.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(16),e=new Uint32Array(t);return e[0]=this.h0,e[1]=this.h1,e[2]=this.h2,e[3]=this.h3,t},c.prototype.buffer=c.prototype.arrayBuffer;var l=function(){var t=d("hex");e&&(t=y(t)),t.create=function(){return new c},t.update=function(e){return t.create().update(e)};for(var i=0;i<o.length;++i){var r=o[i];t[r]=d(r)}return t}();r?module.exports=l:(t.md4=l,h&&define(function(){return l}))}();

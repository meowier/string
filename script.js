let onOutput = (n)=> {
    document.getElementById('output-area').value = n;
}
let md5 = ()=> {
    onOutput(CryptoJS.MD5(document.getElementById('input-area').value));
}

let sha1 = ()=> {
    onOutput(CryptoJS.SHA1(document.getElementById('input-area').value));
}

let sha256 = ()=> {
    onOutput(CryptoJS.SHA256(document.getElementById('input-area').value));
}

let sha512 = ()=> {
    onOutput(CryptoJS.SHA512(document.getElementById('input-area').value));
}

let sha3512 = ()=> {
    onOutput(CryptoJS.SHA3(document.getElementById('input-area').value, { outputLength: 512 }));
}

let sha3384 = ()=> {
    onOutput(CryptoJS.SHA3(document.getElementById('input-area').value, { outputLength: 384 }));
}

let sha3256 = ()=> {
    onOutput(CryptoJS.SHA3(document.getElementById('input-area').value, { outputLength: 256 }));
}

let sha3224 = ()=> {
    onOutput(CryptoJS.SHA3(document.getElementById('input-area').value, { outputLength: 224 }));
}

let ripemd160 = ()=> {
    onOutput(CryptoJS.RIPEMD160(document.getElementById('input-area').value));
}

let revStr = ()=> {
    onOutput(document.getElementById('input-area').value.split('').reverse().join(''));
}

let lengthStr = ()=> {
    onOutput(document.getElementById('input-area').value.length);
}

let enurl = ()=> {
    onOutput(encodeURIComponent(document.getElementById('input-area').value));
}

let deurl = ()=> {
    onOutput(decodeURIComponent(document.getElementById('input-area').value));
}

let minStr = ()=> {
    let e = document.getElementById('input-area').value;
	let out = e.replace(/ /g, '').split('\n').join('');
	onOutput(out);
}

let buildStr = ()=> {
    let e = document.getElementById('input-area').value.split('\n');
	let out = '';
	for(let i = 0; i < e.length; i++){
		out += i == e.length - 1 ? `' ${e[i]} ';` : `' ${e[i]} ' + \n`;
	}
	onOutput(out);
}

let splitStr = ()=> {
	let e = document.getElementById('input-area').value;
	let k = prompt('Nhập khoảng cách muốn chia:');
	let s = prompt('Nhập kí tự ngăn cách: (mặc định bỏ trống là dấu cách)').toString();
	let re = s === '' ? ' ' : s;
	let pattern = new RegExp(`[a-zA-Z0-9:\/!@#$%^&*()?'"_.,<>\\[\\]\\-=+]{${k}}`, 'gm');
	let out = e.match(pattern);
	onOutput(out.join(re) + re + e.slice(out.join('').length, e.length));
}

let rot13 = ()=> {
	function rot(s, i) {
		return s.replace(/[a-zA-Z]/g, function (c) {
			return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + i) ? c : c - 26);
		});
    }
    onOutput(rot(document.getElementById('input-area').value, 13));
}

let upper = ()=> {
    onOutput(document.getElementById('input-area').value.toUpperCase());
}

let lower = ()=> {
    onOutput(document.getElementById('input-area').value.toLowerCase());
}
!function(t,n){var r,e;"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(r=t.Base64,(e=n()).noConflict=function(){return t.Base64=r,e},t.Meteor&&(Base64=e),t.Base64=e)}("undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:this,(function(){"use strict";var t,n="3.7.5",r="function"==typeof atob,e="function"==typeof btoa,o="function"==typeof Buffer,u="function"==typeof TextDecoder?new TextDecoder:void 0,i="function"==typeof TextEncoder?new TextEncoder:void 0,f=Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="),c=(t={},f.forEach((function(n,r){return t[n]=r})),t),a=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,d=String.fromCharCode.bind(String),s="function"==typeof Uint8Array.from?Uint8Array.from.bind(Uint8Array):function(t){return new Uint8Array(Array.prototype.slice.call(t,0))},l=function(t){return t.replace(/=/g,"").replace(/[+\/]/g,(function(t){return"+"==t?"-":"_"}))},h=function(t){return t.replace(/[^A-Za-z0-9\+\/]/g,"")},p=function(t){for(var n,r,e,o,u="",i=t.length%3,c=0;c<t.length;){if((r=t.charCodeAt(c++))>255||(e=t.charCodeAt(c++))>255||(o=t.charCodeAt(c++))>255)throw new TypeError("invalid character found");u+=f[(n=r<<16|e<<8|o)>>18&63]+f[n>>12&63]+f[n>>6&63]+f[63&n]}return i?u.slice(0,i-3)+"===".substring(i):u},y=e?function(t){return btoa(t)}:o?function(t){return Buffer.from(t,"binary").toString("base64")}:p,A=o?function(t){return Buffer.from(t).toString("base64")}:function(t){for(var n=[],r=0,e=t.length;r<e;r+=4096)n.push(d.apply(null,t.subarray(r,r+4096)));return y(n.join(""))},b=function(t,n){return void 0===n&&(n=!1),n?l(A(t)):A(t)},g=function(t){if(t.length<2)return(n=t.charCodeAt(0))<128?t:n<2048?d(192|n>>>6)+d(128|63&n):d(224|n>>>12&15)+d(128|n>>>6&63)+d(128|63&n);var n=65536+1024*(t.charCodeAt(0)-55296)+(t.charCodeAt(1)-56320);return d(240|n>>>18&7)+d(128|n>>>12&63)+d(128|n>>>6&63)+d(128|63&n)},B=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,x=function(t){return t.replace(B,g)},C=o?function(t){return Buffer.from(t,"utf8").toString("base64")}:i?function(t){return A(i.encode(t))}:function(t){return y(x(t))},m=function(t,n){return void 0===n&&(n=!1),n?l(C(t)):C(t)},v=function(t){return m(t,!0)},U=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,F=function(t){switch(t.length){case 4:var n=((7&t.charCodeAt(0))<<18|(63&t.charCodeAt(1))<<12|(63&t.charCodeAt(2))<<6|63&t.charCodeAt(3))-65536;return d(55296+(n>>>10))+d(56320+(1023&n));case 3:return d((15&t.charCodeAt(0))<<12|(63&t.charCodeAt(1))<<6|63&t.charCodeAt(2));default:return d((31&t.charCodeAt(0))<<6|63&t.charCodeAt(1))}},w=function(t){return t.replace(U,F)},S=function(t){if(t=t.replace(/\s+/g,""),!a.test(t))throw new TypeError("malformed base64.");t+="==".slice(2-(3&t.length));for(var n,r,e,o="",u=0;u<t.length;)n=c[t.charAt(u++)]<<18|c[t.charAt(u++)]<<12|(r=c[t.charAt(u++)])<<6|(e=c[t.charAt(u++)]),o+=64===r?d(n>>16&255):64===e?d(n>>16&255,n>>8&255):d(n>>16&255,n>>8&255,255&n);return o},E=r?function(t){return atob(h(t))}:o?function(t){return Buffer.from(t,"base64").toString("binary")}:S,D=o?function(t){return s(Buffer.from(t,"base64"))}:function(t){return s(E(t).split("").map((function(t){return t.charCodeAt(0)})))},R=function(t){return D(T(t))},z=o?function(t){return Buffer.from(t,"base64").toString("utf8")}:u?function(t){return u.decode(D(t))}:function(t){return w(E(t))},T=function(t){return h(t.replace(/[-_]/g,(function(t){return"-"==t?"+":"/"})))},Z=function(t){return z(T(t))},j=function(t){return{value:t,enumerable:!1,writable:!0,configurable:!0}},I=function(){var t=function(t,n){return Object.defineProperty(String.prototype,t,j(n))};t("fromBase64",(function(){return Z(this)})),t("toBase64",(function(t){return m(this,t)})),t("toBase64URI",(function(){return m(this,!0)})),t("toBase64URL",(function(){return m(this,!0)})),t("toUint8Array",(function(){return R(this)}))},O=function(){var t=function(t,n){return Object.defineProperty(Uint8Array.prototype,t,j(n))};t("toBase64",(function(t){return b(this,t)})),t("toBase64URI",(function(){return b(this,!0)})),t("toBase64URL",(function(){return b(this,!0)}))},P={version:n,VERSION:"3.7.5",atob:E,atobPolyfill:S,btoa:y,btoaPolyfill:p,fromBase64:Z,toBase64:m,encode:m,encodeURI:v,encodeURL:v,utob:x,btou:w,decode:Z,isValid:function(t){if("string"!=typeof t)return!1;var n=t.replace(/\s+/g,"").replace(/={0,2}$/,"");return!/[^\s0-9a-zA-Z\+/]/.test(n)||!/[^\s0-9a-zA-Z\-_]/.test(n)},fromUint8Array:b,toUint8Array:R,extendString:I,extendUint8Array:O,extendBuiltins:function(){I(),O()},Base64:{}};return Object.keys(P).forEach((function(t){return P.Base64[t]=P[t]})),P}));
let enbase64 = ()=> {
    onOutput(window.Base64.encode(document.getElementById('input-area').value));
}

let debase64 = ()=> {
    onOutput(window.Base64.encode(document.getElementById('input-area').value));
}

let remRep = ()=> {
	let find = prompt('Nhập kí tự bạn muốn tìm:');
	let rep = prompt('Nhập kí tự muốn thay thế, nếu muốn xoá thì bỏ trống:');
	if (rep == "\\n") {
		rep = "\n";
	}
	else if (rep == "\\t") {
		rep = "\t";
	}
	onOutput(document.getElementById('input-area').value.split(find).join(rep));
}

let debase32 = ()=> {
    onOutput(base32_decode(document.getElementById('input-area').value));
}

let enbase32 = ()=> {
    onOutput(base32_encode(document.getElementById('input-area').value));
}

let escapseJs = () => {
    let e = document.getElementById('input-area').value;
    let out = '';
	try {
		out =  `"${JSON.stringify(JSON.stringify(JSON.parse(e)))}"`
	} catch () {
		out = `"${e.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f")}"`;
	}
    onOutput(out);
}

let unescapseJs = () => {
    let e = document.getElementById('input-area').value;
    onOutput(out);
}

let strToHex = ()=> {
	let e = document.getElementById('input-area').value;
	let out = e.split('').map((value, index) => {
		return e.charCodeAt(index).toString(16);
	}).join('');
	onOutput(out);
}

let hexToStr = ()=> {
	let e  = document.getElementById('input-area').value;
	let out = '';
	for (let n = 0; n < e.length; n += 2) {
		out += String.fromCharCode(parseInt(e.substr(n, 2), 16));
	}
	onOutput(out);
}

let strToBin = ()=> {
	onOutput(Array
		.from(document.getElementById('input-area').value)
		.reduce((acc, char) => acc.concat(char.charCodeAt().toString(2)), [])
		.map(bin => '0'.repeat(8 - bin.length) + bin )
		.join(' '));
}

let binToStr = ()=> {
	onOutput(document.getElementById('input-area').value.split(/\s/).map(function (val){
		return String.fromCharCode(parseInt(val, 2));
	  }).join(""));
}

let strToDec = ()=> {
	let e = document.getElementById('input-area').value;
	let bytes = [];
	for (let i = 0; i < e.length; i++) {
		let realBytes = unescape(encodeURIComponent(e[i]));
		for (let j = 0; j < realBytes.length; j++) {
			bytes.push(realBytes[j].charCodeAt(0));
		}
	}
	let converted = [];
	for (let i = 0; i < bytes.length; i++) {
		let byte = bytes[i].toString(10);
		converted.push(byte);
	}

	onOutput(converted.join(' '));
}

let decToStr = ()=> {
	let e = document.getElementById('input-area').value;
	e = e.replace(/\s+/g, ' ');
	bytes = e.split(' ');
	let out = '';
	for (let i = 0; i < bytes.length; i++) {
		out += String.fromCharCode(bytes[i]);
	}
	onOutput(out);
}

let strToMorse = ()=> {
	let alphabet = {
		'a':  '.-',
		'b':  '-...',
		'c':  '-.-.',
		'd':  '-..',
		'e':  '.',
		'f':  '..-.',
		'g':  '--.',
		'h':  '....',
		'i':  '..',
		'j':  '.---',
		'k':  '-.-',
		'l':  '.-..',
		'm':  '--',
		'n':  '-.',
		'o':  '---',
		'p':  '.--.',
		'q':  '--.-',
		'r':  '.-.',
		's':  '...',
		't':  '-',
		'u':  '..-',
		'v':  '...-',
		'w':  '.--',
		'x':  '-..-',
		'y':  '-.--',
		'z':  '--..',
		'á':  '.--.-',
		'ä':  '.-.-',
		'é':  '..-..',
		'ñ':  '--.--',
		'ö':  '---.',
		'ü':  '..--',
		'1':  '.----',
		'2':  '..---',
		'3':  '...--',
		'4':  '....-',
		'5':  '.....',
		'6':  '-....',
		'7':  '--...',
		'8':  '---..',
		'9':  '----.',
		'0':  '-----',
		',':  '--..--',
		'.':  '.-.-.-',
		'?':  '..--..',
		';':  '-.-.-',
		':':  '---...',
		'/':  '-..-.',
		'-':  '-....-',
		'\'': '.----.',
		'()': '-.--.-',
		'_':  '..--.-',
		'@':  '.--.-.',
		' ':  '.......'
	  };
	onOutput(document.getElementById('input-area').value
		.split('')            
		.map(function(e){     
			return alphabet[e.toLowerCase()] || '';
		})
		.join(' ')            
		.replace(/ +/g, ' '));
}

let mourseToStr = ()=> {
	let e = document.getElementById('input-area').value;
	let alphabet = {
		'.-':     'a',
		'-...':   'b',
		'-.-.':   'c',
		'-..':    'd',
		'.':      'e',
		'..-.':   'f',
		'--.':    'g',
		'....':   'h',
		'..':     'i',
		'.---':   'j',
		'-.-':    'k',
		'.-..':   'l',
		'--':     'm',
		'-.':     'n',
		'---':    'o',
		'.--.':   'p',
		'--.-':   'q',
		'.-.':    'r',
		'...':    's',
		'-':      't',
		'..-':    'u',
		'...-':   'v',
		'.--':    'w',
		'-..-':   'x',
		'-.--':   'y',
		'--..':   'z',
		'.--.-':  'á',
		'.-.-':   'ä',
		'..-..':  'é',
		'--.--':  'ñ',
		'---.':   'ö',
		'..--':   'ü',
		'.----':  '1',
		'..---':  '2',
		'...--':  '3',
		'....-':  '4',
		'.....':  '5',
		'-....':  '6',
		'--...':  '7',
		'---..':  '8',
		'----.':  '9',
		'-----':  '0',
		'--..--': ',',
		'.-.-.-': '.',
		'..--..': '?',
		'-.-.-':  ';',
		'---...': ':',
		'-..-.':  '/',
		'-....-': '-',
		'.----.': '\'',
		'-.--.-': '()',
		'..--.-': '_',
		'.--.-.': '@'
	};
	let words = e.split(/\s{3,}|\.{6,7}/);
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        word = word.replace(/^\s+/, '');
        word = word.replace(/\s+$/, '');
        word = word.replace(/\s+/, ' ');
        words[i] = word;
    }
    var ret = '';
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        let chars = word.split(' ');
        for (let j = 0; j < chars.length; j++) {
            let char = chars[j];
            if (alphabet[char]) {
                var letter = alphabet[char];
            }
            else {
                var letter = '?'
            }
            ret += letter;
        }
        ret += ' ';
    }
    onOutput(ret);
}

let md4hash = ()=> {
	onOutput(md4(document.getElementById('input-area').value));
}

let md2hash = ()=> {
	onOutput(md4(document.getElementById('input-area').value));
}

let dehtml = ()=> {
	onOutput(htmlDecode(document.getElementById('input-area').value));
}

let enhtml = ()=> {
	onOutput(htmlEncode(document.getElementById('input-area').value));
}

let encryptButton = document.getElementById('encrypt');
let decryptButton = document.getElementById('decrypt');

let onEncrypt = ()=> {
	let p = document.getElementById('phrase').value;
	console.log('Button Clicked!');
	let e = document.getElementById("hash");
	let valueEncrypt = e.options[e.selectedIndex].value;
	switch(valueEncrypt) {
		case 'hmacmd5':
			onOutput(CryptoJS.HmacMD5(document.getElementById('input-area').value, p));
			break;
		case 'hmacsha1':
			onOutput(CryptoJS.HmacSHA1(document.getElementById('input-area').value, p));
			break;
		case 'hmacsha256':
			onOutput(CryptoJS.HmacSHA256(document.getElementById('input-area').value, p));
			break;
		case 'hmacsha512':
			onOutput(CryptoJS.HmacSHA512(document.getElementById('input-area').value, p));
			break;
		case 'aes':
			onOutput(CryptoJS.AES.encrypt(document.getElementById('input-area').value, p));
			break;
		case 'des':
			onOutput(CryptoJS.DES.encrypt(document.getElementById('input-area').value, p));
			break;
		case 'tripledes':
			onOutput(CryptoJS.TripleDES.encrypt(document.getElementById('input-area').value, p));
			break;
		case 'rc4':
			onOutput(CryptoJS.RC4.encrypt(document.getElementById('input-area').value, p));
			break;
		case 'rc4drop':
			onOutput(CryptoJS.RC4Drop.encrypt(document.getElementById('input-area').value, p));
			break;
		default:
			onOutput('Encrypt Invalid!');

	}
}

let onDecrypt = ()=> {
	let p = document.getElementById('phrase').value;
	console.log('Button Clicked!');
	let e = document.getElementById("hash");
	let valueEncrypt = e.options[e.selectedIndex].value;
	switch(valueEncrypt) {
		case 'aes':			
			onOutput(CryptoJS.AES.decrypt(document.getElementById('input-area').value, p).toString(CryptoJS.enc.Utf8));
			break;
		case 'des':
			onOutput(CryptoJS.DES.decrypt(document.getElementById('input-area').value, p).toString(CryptoJS.enc.Utf8));
			break;
		case 'tripledes':
			onOutput(CryptoJS.TripleDES.decrypt(document.getElementById('input-area').value, p).toString(CryptoJS.enc.Utf8));
			break;
		case 'rc4':
			onOutput(CryptoJS.RC4.decrypt(document.getElementById('input-area').value, p).toString(CryptoJS.enc.Utf8));
			break;
		case 'rc4drop':
			onOutput(CryptoJS.RC4Drop.decrypt(document.getElementById('input-area').value, p).toString(CryptoJS.enc.Utf8));
			break;
		default:
			onOutput('Decrypt Invalid!');

	}

}
encryptButton.addEventListener('click', onEncrypt);
decryptButton.addEventListener('click', onDecrypt);

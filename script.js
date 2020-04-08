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

let enbase64 = ()=> {
    onOutput(window.btoa(document.getElementById('input-area').value));
}

let debase64 = ()=> {
    onOutput(window.atob(document.getElementById('input-area').value));
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
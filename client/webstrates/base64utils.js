function base64toBytes(b64urlstring) {
    return new Uint8Array(atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/')).split('').map(val => {
    return val.charCodeAt(0);
  }));
}

function Uint8ToString(u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}

function bytesArrToBase64(byteArray) {
    return btoa(Uint8ToString(byteArray));
    //return btoa(byteArray.reduce((data, byte) => data + String.fromCharCode(byte)));
}

function bytesToString(byteArray) {
    return byteArray.toString();
}

function stringToBytes(str) {
  return new Uint8Array(str.split(",").map(x => Number(x)));
}

exports.base64toBytes = base64toBytes;
exports.bytesArrToBase64 = bytesArrToBase64;
exports.bytesToString = bytesToString;
exports.stringToBytes = stringToBytes;
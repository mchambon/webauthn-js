
// A FAIRE

const testBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
const base64url = arrayBufferToBase64Url(testBuffer); // "AQIDBA"
console.log(base64url);
const backToBuffer = base64UrlToArrayBuffer(base64url);
console.log(new Uint8Array(backToBuffer)); // [1, 2, 3, 4]
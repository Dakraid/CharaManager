// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Encoding UTF-8 ⇢ base64
export default function b64EncodeUnicode(str: string) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
    );
}

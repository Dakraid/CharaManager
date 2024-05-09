// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Decoding base64 ⇢ UTF-8
export default function b64DecodeUnicode(str: string) {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
}

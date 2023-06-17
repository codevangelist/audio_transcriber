"use-client"
let recognizer;

if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
    recognizer = new webkitSpeechRecognition();
}
export default {recognizer};
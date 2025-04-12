import { SpeechRecognitionType } from "./types";

declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognitionType;
        webkitSpeechRecognition?: typeof SpeechRecognitionType;
        mozSpeechRecognition?: typeof SpeechRecognitionType;
        msSpeechRecognition?: typeof SpeechRecognitionType;
    }
}
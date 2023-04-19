import React from 'react';
import { useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

export default function Robot(props) {
    const { speak, cancel } = useSpeechSynthesis(() => {
        // on end
    })



    useEffect(() => {
        speakBot(props.speakBotText)
    }, [props.speakBotText])

    useEffect(() => {
        cancel()
    }, [props.stopBotSpeak])


    const speakBot = (text) => {
        if (props.botVoice.id === 0 || text === "") {
            // disabled
            return
        }

        // replace special characters with space to add delay
        text = text.replace(/[^\w\s]/gi, ' ')


        // speak text
        speak({
            text: text,
            voice: props.botVoice.voices[props.botVoice.id],
            rate: 1.0,
            pitch: 0.7
        })
    }


    return (
        <>
        </>
    )
}
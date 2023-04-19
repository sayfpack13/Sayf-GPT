
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useEffect } from 'react';
import { useRef } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ChatHeader(props) {
    const [message, setMessage] = useState("")
    const [stopped, setStopped] = useState(false)


    var chat_message_ref = useRef()




    const sendMessage = () => {
        // check message and send
        if (message.trim() === "") {
            return
        }

        props.onSend(message)
        setMessage("")
    }

    const stopCHATGPTThink = () => {
        if (!stopped) {
            setStopped(true)
            props.stopCHATGPTThink()
        }
    }

    useEffect(() => {

        if (props.bot_Message_Loaded) {
            setStopped(false)
            chat_message_ref.focus()
        }

    }, [props.bot_Message_Loaded])




    return (

        <Paper className='chat-header' sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
            <Button className='btn left' color='error' onClick={() => { stopCHATGPTThink() }} disabled={props.bot_Message_Loaded || stopped} variant="contained" endIcon={<CancelIcon />}>
                Stop
            </Button>


            <TextareaAutosize
                variant="outlined"
                className='chat-message'
                minRows={2}
                ref={(el) => { chat_message_ref = el }}
                onChange={(e) => { setMessage(e.target.value) }}
                value={message}
                disabled={!props.bot_Message_Loaded}
                onKeyDown={(e) => { if (e.keyCode === 13 && !e.shiftKey) { sendMessage() } }}
            />

            <Button className='btn right' onClick={() => { sendMessage() }} disabled={!props.bot_Message_Loaded} variant="contained" endIcon={<SendIcon />}>
                Send
            </Button>
        </Paper>

    );
}
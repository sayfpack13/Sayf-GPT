import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Typography } from '@mui/material';


export default function ChatBody(props) {


    const scrollToBottom = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }

    useEffect(() => {
        if (!props.load_More_Pressed) {
            scrollToBottom()
        }
    }, [props.messages]
    )




    return (
        <>
            <List className='chat-body'>
                {props.messages.map((message, index) => (
                    <ListItem key={index} className={message.role==="user" ? "message" : "message bot"}>
                        <ListItemAvatar>
                            <Avatar className='avatar' alt="Profile Picture">
                                {message.role === "user" ? <PersonIcon /> : <SmartToyIcon />}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText className='content' primary={<div className='head'><Typography className='username'>{message.role === "user" ? props.username : props.botname}</Typography><Typography className='date'>({message.time})</Typography></div>} secondary={message.content} />
                    </ListItem>
                ))}
            </List>

        </>
    );
}
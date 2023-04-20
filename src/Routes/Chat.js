import React from 'react'
import { getCHATGPTMessage, getChatHistory, getDateTime, max_Chat_History_Load, stopBotMessages } from '../assets/js/Functions'
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import ChatHeader from '../components/Chat/ChatHeader';
import ChatBody from '../components/Chat/ChatBody';
import UploadIcon from '@mui/icons-material/Upload';
import Robot from "../assets/js/Robot"
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { messageSounds, playRandomSound } from '../assets/js/Sounds';


export default class Chat extends React.Component {
    constructor() {
        super()
        this.state = ({
            Component_Loaded: false,
            bot_Message_Loaded: true,
            load_More_Pressed: false,
            chat_history: [],
            chat: [],
            max_Messages_Show: 10,
            speakBotText: "",
            stopBotSpeak: false
        })
        this.max_Messages_Load = 10
        this.last_word = ""
        this.speakBotMessages = []
        this.maxSpeakBotMessages = 5


        window.onbeforeunload = () => {
            // on page close remove last user and bot message if they are messaging

            if (this.state.bot_Message_Loaded) {
                return
            }
            getChatHistory((chat_history) => {
                localStorage.setItem("chat", JSON.stringify(chat_history.slice(0, -2)))

                return
            })

        }

    }





    componentDidMount() {
        getChatHistory((chat_history) => {
            this.setState({
                chat_history: chat_history,
                chat: chat_history.slice(-this.state.max_Messages_Show),
                Component_Loaded: true
            })

        })
    }


    concatArray = (array) => {
        let text = ""
        for (let a = 0; a < array.length; a++) {
            text += array[a] + " "
        }

        return text
    }


    speakBot = (message, done) => {
        let splited_text = message.split(" ")
        let speak_text = ""



        if (splited_text[splited_text.length - 1] === "" || splited_text.length > 1) {
            speak_text = this.last_word + this.concatArray(splited_text.slice(0, -1))
            this.last_word = splited_text.slice(-1)
        }
        else if (splited_text[0] === "") {
            speak_text = this.last_word
            this.last_word = message
        } else {
            // 1 word
            this.last_word += message
        }


        if (speak_text !== "" || done) {
            // send text to speak bot
            // store messages instead of saying each one which causes long delay
            this.speakBotMessages.push(speak_text)

            if (!done && this.speakBotMessages.length <= this.maxSpeakBotMessages) {
                return
            }


            speak_text = ""
            for (let a = 0; a < this.speakBotMessages.length; a++) {
                speak_text += this.speakBotMessages[a]
            }
            this.speakBotMessages = []


            this.setState({ speakBotText: "" }, () => {
                this.setState({ speakBotText: speak_text })
            })
        }
    }



    saveMessage = (role, content, callback, pos = -1) => {
        // add/modify chat+chat_history messages
        var chat_history = this.state.chat_history
        var chat = this.state.chat


        if (chat_history[pos] === undefined) {
            // push new message
            var message = { id: chat_history.length, time: getDateTime(), role: role, content: content, internet_content: undefined }

            this.setState({
                chat_history: [...chat_history, message],
                chat: [...(chat.slice(-(this.state.max_Messages_Show - 1))), message]
            }, callback)
        } else {
            // update existing message
            chat_history[pos].content += content

            var pos_chat = pos - chat_history.length - 1
            if (pos_chat >= 0) {
                chat[pos_chat].content += content
            }


            this.setState({
                chat_history: chat_history,
                chat: chat
            }, callback)
        }

    }


    updateChat = (callback) => {
        // add chat_history messages to chat
        this.setState({
            chat: this.state.chat_history.slice(-this.state.max_Messages_Show)
        }, callback)
    }



    saveChat = () => {
        return localStorage.setItem("chat", JSON.stringify(this.state.chat_history))
    }






    sendMessage = (user_Message) => {
        user_Message = user_Message.trim()


        if (!this.state.bot_Message_Loaded) {
            return
        }


        this.setState({ bot_Message_Loaded: false }, () => {
            // save user and initiliaze bot message
            this.saveMessage("user", user_Message, () => {
                this.saveMessage("assistant", "", () => {
                    playRandomSound(messageSounds)
                    var new_bot_message_index = this.state.chat_history.length - 1
                    this.saveChat()
                    this.stopBotSpeak()

                    // get bot message
                    getCHATGPTMessage(user_Message, 1, this.props.settings, this.state.chat_history.slice(-max_Chat_History_Load), (message, done, error) => {

                        if (message !== " " && message !== "\\n") {
                            this.speakBot(message, done)
                            this.saveBotMessage(message, new_bot_message_index, error)
                        }

                        if (done) {
                            this.setState({ bot_Message_Loaded: true })
                        }
                    })
                })
            })
        })
    }


    saveBotMessage = (message, pos, error = false) => {
        this.saveMessage("assistant", message, () => {
            if (error) {
                // if error occured remove user and bot message from chat_history
                this.setState({
                    chat_history: this.state.chat_history.slice(0, -2)
                }, () => {
                    this.saveChat()
                })
            } else {
                this.saveChat()
            }
        }, pos)
    }


    loadMoreMessages = () => {
        var new_max_Messages_Show = this.state.max_Messages_Show + this.max_Messages_Load
        this.setState({
            load_More_Pressed: true,
            max_Messages_Show: new_max_Messages_Show > this.state.chat_history.length ? this.state.chat_history.length : new_max_Messages_Show
        }, () => {


            this.updateChat(() => {
                this.setState({ load_More_Pressed: false })
            })
        })
    }


    stopBotSpeak = () => {
        this.setState({ stopBotSpeak: !this.state.stopBotSpeak })
    }



    stopCHATGPTThink = () => {
        stopBotMessages()
        this.stopBotSpeak()
    }



    render() {
        if (!this.state.Component_Loaded) {
            return (
                <>
                </>
            )
        } else {
            return (
                <>
                    <Box className='chat'>
                        <CssBaseline />
                        {this.state.max_Messages_Show < this.state.chat_history.length ?
                            <Tooltip className='icon-btn centered' title="Load More" onClick={() => { this.loadMoreMessages() }}>
                                <IconButton>
                                    <UploadIcon />
                                </IconButton>
                            </Tooltip> : <></>
                        }



                        <ChatBody load_More_Pressed={this.state.load_More_Pressed} messages={this.state.chat} username={this.props.settings.username} botname={this.props.settings.botname} />
                        <ChatHeader stopCHATGPTThink={this.stopCHATGPTThink} bot_Message_Loaded={this.state.bot_Message_Loaded} onSend={this.sendMessage} />
                        <Robot stopBotSpeak={this.state.stopBotSpeak} botVoice={this.props.settings.botVoice} speakBotText={this.state.speakBotText} />

                    </Box>
                </>
            )
        }

    }
}

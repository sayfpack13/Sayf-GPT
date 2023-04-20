import React from "react";
import "../assets/css/style.css"
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Chat from '../Routes/Chat';
import { TextField, Tooltip } from '@mui/material';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { WEBSITE_NAME, getIPInformations, getSettings, getVoices, saveSettings } from '../assets/js/Functions';
import { clickSounds, hoverSounds, loadedSounds, loadingSounds, muteSounds, playRandomSound } from "../assets/js/Sounds"
import Slider from '@mui/material/Slider';
import Home from '../Routes/Home';
import { Button } from "@mui/material";
import Fade from '@mui/material/Fade';
import Loader from "./Loader";





export default class Index extends React.Component {
    constructor() {
        super()

        this.state = {
            openMenu: false,
            Component_Loaded: false,
            setLoaded: false,
            path: "/",




            settings: {
                openai_api_key: "",
                serper_api_key: "",
                username: "",
                botname: "",
                botTemperature: 0,
                botUseInternet: true,
                botVoice: 0,
                internetUseCount: 0,
                internetContentUse: false,
                muteSounds: false
            }
        }

        this.botVoices = []





    }







    componentDidMount() {
        var settings = getSettings()


        // check if sound is muted
        muteSounds(settings.muteSounds)


        // play loading sound
        playRandomSound(loadingSounds, true, true)

        // temporary remove after done
        //this.setState({ Component_Loaded: true })

        getVoices((voices) => {
            this.botVoices = [{ name: "Disabled" }, ...voices]

            if (settings.botVoice > voices.length) {
                settings.botVoice = 0
            }


            // get user ip
            getIPInformations(() => {
                // done loading this component now load others
                let pathname = window.location.pathname
                if (!["/", "/chat"].includes(pathname)) {
                    pathname = "/"
                }

                // load images
                var loaded_img = new Image()
                var home_img = new Image()

                loaded_img.onload = () => {
                    home_img.onload = () => {
                        setTimeout(()=>{
                            this.setState({
                                setLoaded: true,
                                path: pathname,
                                settings: settings
                            }, () => {
                                // stop loading sound
                                playRandomSound(loadedSounds, false, true)
    
    
                                // add HTML elements effects
                                document.querySelectorAll("button, .item").forEach((element) => {
                                    element.addEventListener("mouseenter", () => {
                                        playRandomSound(hoverSounds)
                                    })
    
                                    element.addEventListener("mousedown", () => {
                                        playRandomSound(clickSounds)
                                    })
                                })
    
    
                                // all done
                                setTimeout(() => {
                                    this.setState({ Component_Loaded: true })
                                }, 2000)
                            })
                        },8000)

                    }
                    home_img.src = "/image/bg1.jpg"
                }
                loaded_img.src = "/image/loaded.gif"
            })
        })

    }




    setBotVoice = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ botVoice: e.target.value } } }, () => {
            saveSettings(this.state.settings)
        })
    }


    setbotUseInternet = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ botUseInternet: e.target.checked } } }, () => {
            saveSettings(this.state.settings)
        })
    }


    setUsername = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ username: e.target.value } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setBotname = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ botname: e.target.value } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setBotTemperature = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ botTemperature: (e.target.value / 100) } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setInternetUseCount = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ internetUseCount: (e.target.value) } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setInternetContentUse = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ internetContentUse: (e.target.checked) } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setMuteSounds = (e) => {
        if (e.target.checked) {
            // mute sounds
            muteSounds(true)
        } else {
            muteSounds(false)
        }
        this.setState({ settings: { ...this.state.settings, ...{ muteSounds: (e.target.checked) } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setOpenai_api_key = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ openai_api_key: e.target.value } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    setSerper_api_key = (e) => {
        this.setState({ settings: { ...this.state.settings, ...{ serper_api_key: e.target.value } } }, () => {
            saveSettings(this.state.settings)
        })
    }

    render() {
        return (
            <>
                <Loader loading_img={this.state.loading_img} loaded_img={this.state.loaded_img} parent_loaded={this.state.Component_Loaded} loaded={this.state.setLoaded} />




                <Fade in={this.state.Component_Loaded}>
                    <Box display={this.state.Component_Loaded ? "flex" : "none"} >
                        <CssBaseline />
                        <AppBar className='navbar' position="fixed" open={this.state.openMenu} >
                            <Toolbar>
                                <Fade in={!this.state.openMenu}>
                                    <IconButton className='icon-btn small' onClick={() => { this.setState({ openMenu: true }) }} sx={{ marginRight: "10px", ...(this.state.openMenu && { display: 'none' }) }}>
                                        <MenuIcon />
                                    </IconButton>
                                </Fade>
                                <Typography variant="h6" noWrap component="div">
                                    {WEBSITE_NAME}
                                </Typography>


                                <Button className="btn big right" onClick={() => this.setState({ path: "/" })} variant="contained">Home</Button>
                                <Button className="btn big right" onClick={() => this.setState({ path: "/chat" })} variant="contained">Chat</Button>


                            </Toolbar>
                        </AppBar>


                        <Drawer className='drawer' sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', }, }}
                            variant="persistent"
                            anchor="left"
                            open={this.state.openMenu}
                        >

                            <DrawerHeader >
                                <IconButton className='icon-btn' onClick={() => { this.setState({ openMenu: false }) }}>
                                    <ChevronLeftIcon sx={{ color: "#fff" }} />
                                </IconButton>
                            </DrawerHeader>


                            <Divider />


                            <Box className='settings'>
                                <FormControl fullWidth className='item'>
                                    <TextField
                                        label="User name"
                                        value={this.state.settings.username}
                                        variant="outlined"
                                        onChange={this.setUsername}
                                    />
                                </FormControl>


                                <Divider className='space' />

                                <FormControl fullWidth className='item'>
                                    <TextField
                                        label="Bot name"
                                        value={this.state.settings.botname}
                                        variant="outlined"
                                        onChange={this.setBotname}
                                    />
                                </FormControl>


                                <Divider className='space' />

                                <FormControl fullWidth className='item'>
                                    <Tooltip title="OpenAI API key used to get the best answers from different AI models">
                                        <TextField
                                            label="OpenAI API Key"
                                            value={this.state.settings.openai_api_key}
                                            variant="outlined"
                                            onChange={this.setOpenai_api_key}
                                        />
                                    </Tooltip>
                                </FormControl>


                                <Divider className='space' />

                                <FormControl fullWidth className='item'>
                                    <Tooltip title="Serper API key used so to surf the internet so the Bot can provide real-time informations">
                                        <TextField
                                            label="Serper (Google search) API Key"
                                            value={this.state.settings.serper_api_key}
                                            variant="outlined"
                                            onChange={this.setSerper_api_key}
                                        />
                                    </Tooltip>
                                </FormControl>



                                <Divider className='space line' />

                                <FormControl fullWidth className='item'>
                                    <Tooltip title="Bot can speak and read messages with different voices">
                                        <div>
                                            <InputLabel>Bot Voice Type</InputLabel>
                                            <Select
                                                className='select'
                                                MenuProps={{ className: "drawer-list" }}
                                                value={this.state.settings.botVoice}
                                                label="Bot Voice Type"
                                                onChange={this.setBotVoice}
                                            >
                                                {this.botVoices.map((voice, index) => {
                                                    return (
                                                        <MenuItem key={index} value={index}>{voice.name}</MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </div>
                                    </Tooltip>
                                </FormControl>



                                <Divider className='space' />



                                <FormControl fullWidth className='item'>
                                    <Tooltip title="Bot answer type can be adjusted to give short simple answers or be more creative and provide more informations">
                                        <div>
                                            <Typography sx={{ cursor: "default", color: "#fff" }} gutterBottom>Bot answer Type</Typography>
                                            <Slider
                                                value={this.state.settings.botTemperature * 100}
                                                valueLabelFormat={(value) => { return value + " %" }}
                                                valueLabelDisplay="auto"
                                                step={10}
                                                marks={[{ value: 10, label: "Simple" }, { value: 100, label: "Creative" }]}
                                                min={10}
                                                max={100}
                                                onChange={this.setBotTemperature}
                                            />
                                        </div>
                                    </Tooltip>
                                </FormControl>

                                <Divider className='space' />

                                <FormControl fullWidth className='item centered'>
                                    <Tooltip title="Bot will use Internet to answer when needed">
                                        <FormControlLabel control={
                                            <Checkbox className='icon-btn small simple' checked={this.state.settings.botUseInternet} onChange={this.setbotUseInternet} />
                                        } label="Use Internet" />
                                    </Tooltip>
                                </FormControl>



                                {this.state.settings.botUseInternet &&
                                    <>
                                        <Divider className='space' />

                                        <FormControl fullWidth className='item centered'>
                                            <Tooltip title="Bot will use chat history internet content to answer when needed">
                                                <FormControlLabel control={
                                                    <Checkbox className='icon-btn small simple' checked={this.state.settings.internetContentUse} onChange={this.setInternetContentUse} />
                                                } label="Use Saved Internet Content" />
                                            </Tooltip>
                                        </FormControl>

                                        <Divider className='space' />

                                        <FormControl fullWidth className='item'>
                                            <Tooltip title="How many times Bot will search in the internet to answer">
                                                <div>
                                                    <Typography sx={{ cursor: "default", color: "#fff" }} gutterBottom>Internet Search Count</Typography>
                                                    <Slider
                                                        value={this.state.settings.internetUseCount}
                                                        valueLabelFormat={(value) => { return value + " time" }}
                                                        valueLabelDisplay="auto"
                                                        step={1}
                                                        min={1}
                                                        max={3}
                                                        onChange={this.setInternetUseCount}
                                                    />
                                                </div>
                                            </Tooltip>
                                        </FormControl>

                                    </>

                                }


                                <Divider className='space line' />

                                <FormControl fullWidth className='item centered'>
                                    <Tooltip title="Enable/Disable sound effects">
                                        <FormControlLabel control={
                                            <Checkbox className='icon-btn small simple' checked={this.state.settings.muteSounds} onChange={this.setMuteSounds} />
                                        } label="Mute Sound Effects" />
                                    </Tooltip>
                                </FormControl>

                            </Box>
                        </Drawer>


                        <Main open={this.state.openMenu}>
                            <DrawerHeader />

                            <Fade hidden={this.state.path !== "/"} in={this.state.path === "/"}>
                                <div><Home /></div>
                            </Fade>

                            <Fade hidden={this.state.path !== "/chat"} in={this.state.path === "/chat"}>
                                <div><Chat settings={{ ...this.state.settings, ...{ botVoice: { id: this.state.settings.botVoice, voices: this.botVoices } } }} /></div>
                            </Fade>

                        </Main>
                    </Box>
                </Fade>
            </>
        )

    }
}










const drawerWidth = 300;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        }),
    }),
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));
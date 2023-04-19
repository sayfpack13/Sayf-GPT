import React from 'react'
import { Fade } from '@mui/material'
import { getRandomArrayItem, welcome_messages } from '../assets/js/Functions'


export default function Loader(props) {



    if (!props.parent_loaded) {
        return (
            <>
                <Fade in>
                    <div>
                        <div className='loader loading'></div>
                        <h1 className='loader title'>Loading...</h1>
                    </div>
                </Fade>

                <Fade in={props.loaded}>
                    <div>
                        <div className='loader loaded'></div>
                        <h1 className='loader title'>{getRandomArrayItem(welcome_messages)}</h1>
                    </div>
                </Fade>
            </>
        )
    } else {
        return (
            <></>
        )
    }

}

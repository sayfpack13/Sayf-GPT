import { getRandomArrayItem } from './Functions';

// VARS
const { Howl } = require('howler');
const fade_time = 1000
var current_sound = { id: -1, sound: null }
var mute_sound = false

export const loadedSounds = [
    new Howl({ src: ["sound/loaded-1.mp3"] }),
    new Howl({ src: ["sound/loaded-3.mp3"] })
]

export const loadingSounds = [
    new Howl({ src: ["sound/loading-1.mp3"] }),
    new Howl({ src: ["sound/loading-3.mp3"] })
]

export const hoverSounds = [
    new Howl({ src: ["sound/hover1.mp3"] })
]

export const clickSounds = [
    new Howl({ src: ["sound/click1.mp3"] })
]

export const messageSounds = [
    new Howl({ src: ["sound/message1.mp3"] })
]


export function muteSounds(bool) {
    mute_sound = bool
}


export function playRandomSound(sounds, loop = false, fade = false) {
    if (mute_sound) {
        return
    }

    // get last current sound id to play parralel sounds
    // if not found play random
    let id

    if (current_sound.sound === null) {
        id = Math.floor(Math.random() * sounds.length)
    }
    else {
        if (current_sound.id > sounds.length - 1) {
            id = Math.floor(Math.random() * sounds.length)
        } else {
            id = current_sound.id
        }
    }


    // play sound
    
    if (loop) {
        sounds[id].loop(true)
    }

    if (fade) {
        if (current_sound.sound !== null) {
            current_sound.sound.fade(1, 0, fade_time)
        }

        sounds[id].fade(0, 1, fade_time)
    }

    sounds[id].play()


    // save playing sound
    current_sound = { id: id, sound: sounds[id] }
}

export function stopCurrentSound() {
    current_sound.sound.stop()
}
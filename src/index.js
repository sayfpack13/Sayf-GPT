import ReactDOM from 'react-dom/client';
import "./assets/css/style.css"
import * as React from 'react';
import Index from './components/Index';
import { useState } from 'react';
import "./assets/css/fake-captcha.css"


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
)




function App() {
    const [enter, setEnter] = useState(false)
    const [captchaClicked, setcaptchaClicked] = useState(false)
    const [passCaptcha, setPassCaptcha] = useState(false)




    const captchaClick = () => {
        if (passCaptcha) {
            return
        }

        setcaptchaClicked(true)


        // load loader image
        var loader_img = new Image()
        loader_img.onload = () => {

            setPassCaptcha(true)

            // enter loader page
            setTimeout(() => {
                setcaptchaClicked(false)
                setTimeout(() => {
                    setEnter(true)
                }, 500)
            }, 500)

        }
        loader_img.src = "/image/loader.gif"
    }



    if (enter) {
        return (
            <Index />
        )
    } else {
        return (
            <>
                <div className={captchaClicked ? "loading" : (passCaptcha ? "pass" : "")} onClick={captchaClick} id="fake-captcha">
                    <div id="fake-checkbox"></div>
                    Are you really a human?
                </div>
            </>
        )
    }
}
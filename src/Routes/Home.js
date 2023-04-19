import * as React from 'react';
import { WEBSITE_NAME } from '../assets/js/Functions';
import "../assets/css/Home.css"

export default class Home extends React.Component {



  render() {
    return (
      <>
        <section className="section-1">
            <h2 className="text big">{WEBSITE_NAME}</h2>
            <h3 className="text">The Future of Internet-based AI is Now !!</h3>
            <h3 className="text">Unlock the Full Potential of Internet-based AI Technology with Our Cutting-Edge Model</h3>
        </section>
      </>
    )
  }

}
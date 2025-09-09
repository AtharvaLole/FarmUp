import React from 'react'
import landingimg from "./assets/landingpgimg.png"
import "./Landing.css"
function Landing() {
  return (
    <div className="landing-outer-container">
        <div className="landing-inner-container">
            <img src={landingimg} alt="landingimg"/>
            <div className="buttons-landing-page">
                <button className="get-started-landing">
                    Get Started
                </button>
                <button className="learn-more-landing">
                    Learn More
                </button>
            </div>  
        </div>
        <div className="below-landing-contents">
            <h1>Welcome to Our Platform</h1>
        </div>
    </div>
  )
}

export default Landing
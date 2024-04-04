import React from 'react';
import './hamburger.css';

const HamburgerMenu = () => {
    const meta = {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
    }
    return (
        <div>
            <meta {...meta} />
            <section className="top-nav">
                <div>
                {/* GAMES */}
                
                </div>
                <input id="menu-toggle" type="checkbox" />
                <label className='menu-button-container' htmlFor="menu-toggle">
                <div className='menu-button'></div>
            </label>
                <ul className="menu">
                <li><a href='/'>Connexion</a></li>
                <li><a href='/games'>Menu de sélection</a></li>
                <li><a href='/bataille'>Bataille</a></li>
                <li><a href='/6quiprend'>6QuiPrend</a></li>
                <li><a href="/magic">Shadow hunter</a> </li>
                <li><a href='/leaderboardbataille'>Classement bataille</a></li>
                <li><a href='/leaderboard6quiprend'>Classement 6QuiPrend</a></li>
                <li><a href='/leaderboardMagic'>Classement du Shadow hunter</a></li>
                </ul>
            </section>
        </div>
    );
};

export default HamburgerMenu;

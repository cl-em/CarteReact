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
            <section class="top-nav">
                <div>
                GAMES
                
                </div>
                <input id="menu-toggle" type="checkbox" />
                <label class='menu-button-container' for="menu-toggle">
                <div class='menu-button'></div>
            </label>
                <ul class="menu">
                <li><a href='/'>Login</a></li>
                <li><a href='/games'>Games</a></li>
                <li><a href='/bataille'>Bataille</a></li>
                <li><a href='/6quiprend'>6QuiPrend</a></li>
                <li><a href='/leaderboardbataille'>Leaderboard Bataille</a></li>
                <li><a href='/leaderboard6quiprend'>Leaderboard 6QuiPrend</a></li>
                </ul>
            </section>
        </div>
    );
};

export default HamburgerMenu;

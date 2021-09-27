import React from 'react';
import '../styles/Footer.css';

export default class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <footer className="Footer">
                <a href="https://github.com/GastonGit/Hot-Twitch-Clips">
                    About
                </a>
            </footer>
        );
    }
}

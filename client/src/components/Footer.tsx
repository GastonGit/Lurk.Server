import React from 'react';
import '../styles/Footer.css';

export default class Footer extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <footer className="Footer">
                <a href="https://github.com/GastonGit/Hot-Twitch-Clips">
                    About
                </a>
            </footer>
        );
    }
}

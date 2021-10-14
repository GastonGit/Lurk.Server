import React from 'react';
import '../styles/Header.css';

export default class Header extends React.Component<unknown, unknown> {
    render(): JSX.Element {
        return (
            <header className="Head">
                <div className="HeaderContent">
                    <a
                        href="https://gastongit.com/hotclips"
                        className="Header-link"
                    >
                        Hot Twitch Clips
                    </a>
                </div>
            </header>
        );
    }
}

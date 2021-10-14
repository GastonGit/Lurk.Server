import React from 'react';
import '../styles/Header.css';

export default class Header extends React.Component<unknown, unknown> {
    render(): JSX.Element {
        return (
            <div>
                <header className="Head">
                    <div className="HeaderContent">
                        <div className="HeaderContentMain">
                            <a
                                href="https://gastongit.com/hotclips"
                                className="Header-link"
                            >
                                Hot Twitch Clips
                            </a>
                        </div>
                    </div>
                </header>
            </div>
        );
    }
}

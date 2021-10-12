import React from 'react';
import '../styles/Header.css';

export default class Header extends React.Component<unknown, unknown> {
    render(): JSX.Element {
        return (
            <header className="Head">
                <div className="HeaderContent">
                    <div className="HeaderContentMain">
                        <a href="https://gastongit.com" className="Header-link">
                            GastonGit
                        </a>
                    </div>
                </div>
            </header>
        );
    }
}

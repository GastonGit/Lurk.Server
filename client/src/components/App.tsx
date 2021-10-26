import React from 'react';
import '../styles/App.css';
import VideoPlayer from './VideoPlayer';

export default class App extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div className="app">
                <div className="app__content">
                    <VideoPlayer />
                </div>
            </div>
        );
    }
}

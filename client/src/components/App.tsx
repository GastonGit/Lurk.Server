import React from 'react';
import '../styles/App.css';
import Video from './Video';

export default class App extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div className="App">
                <div className="AppContent">
                    <Video />
                </div>
            </div>
        );
    }
}

import React from 'react';
import '../styles/VideoPlayer.css';
import Video from './Video';

export default class VideoPlayer extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div>
                <Video />
            </div>
        );
    }
}

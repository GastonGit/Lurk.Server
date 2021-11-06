import React from 'react';
import '../styles/VideoPlayer.css';

interface VideoState {
    playlist: Array<string>;
    clipIndex: number;
    awaitingClips: boolean;
    updateInterval: NodeJS.Timeout | undefined;
}

export default class Video extends React.Component<unknown, VideoState> {
    constructor(props: unknown) {
        super(props);

        this.state = {
            playlist: [],
            clipIndex: -1,
            awaitingClips: false,
            updateInterval: undefined,
        };

        this.nextClip = this.nextClip.bind(this);
    }

    updateTimeInSeconds = 60;

    componentDidMount(): void {
        this.getClips().then(() => {
            this.initClipEvents(
                document.querySelector('.js-video__clip') as HTMLVideoElement,
            );

            this.initUpdateInterval();
        });
    }

    componentWillUnmount(): void {
        clearInterval(this.state.updateInterval as NodeJS.Timeout);
    }

    async getClips(): Promise<void> {
        const clips = await this.fetchClips();

        this.setState({ playlist: [...clips] });
        this.nextClip();
    }

    async fetchClips(): Promise<Array<string>> {
        let clips = [];

        try {
            const response = await fetch(
                process.env.REACT_APP_SERVER_URL || '',
            );
            clips = await response.json();
        } catch (e) {
            console.error(e);
        }

        return clips;
    }

    initClipEvents(videoElement: HTMLVideoElement): void {
        videoElement.onended = () => {
            this.nextClip();
        };

        videoElement.onerror = () => {
            console.log('Error loading current clip, playing the next clip');
            this.nextClip();
        };
    }

    initUpdateInterval(): void {
        const updateInterval = setInterval(
            this.updateList.bind(this),
            this.updateTimeInSeconds * 1000,
        );

        this.setState({ updateInterval: updateInterval });
    }

    nextClip(): void {
        if (this.state.clipIndex + 1 < this.state.playlist.length) {
            this.playNextVideo();
        } else {
            this.setState({ awaitingClips: true });
        }
    }

    playNextVideo(): void {
        this.setState((prevState) => ({
            clipIndex: prevState.clipIndex + 1,
        }));
    }

    async updateList(): Promise<void> {
        const clips = await this.fetchClips();

        this.addNewClips([...clips]);
        this.newClipsFound();
    }

    addNewClips(newClips: Array<string>): void {
        for (let i = 0; i < newClips.length; i++) {
            if (!this.state.playlist.includes(newClips[i])) {
                const clips = [...this.state.playlist];
                clips.push(newClips[i]);

                this.setState({
                    playlist: clips,
                });
            }
        }
    }

    newClipsFound(): void {
        if (this.state.awaitingClips) {
            this.setState({ awaitingClips: false });
            this.nextClip();
        }
    }

    render(): JSX.Element {
        if (!this.state.playlist) {
            return <span>Loading...</span>;
        }

        return (
            <video
                className="js-video__clip"
                src={this.state.playlist[this.state.clipIndex]}
                autoPlay={true}
                controls
                muted
            />
        );
    }
}

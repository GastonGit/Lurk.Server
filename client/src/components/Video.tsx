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

        this.setClips(clips);
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

    setClips(clips: Array<string>): void {
        this.setState({ playlist: [...clips] });
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
        const videoElement = document.querySelector(
            '.js-video__clip',
        ) as HTMLVideoElement;

        const nextClipIndex = this.state.clipIndex + 1;

        if (nextClipIndex < this.state.playlist.length) {
            this.showVideo(videoElement);
            this.playNextVideo();
        } else {
            this.hideVideo(videoElement);
        }
    }

    showVideo(videoElement: HTMLVideoElement): void {
        videoElement.style.display = 'block';
    }

    hideVideo(videoElement: HTMLVideoElement): void {
        videoElement.style.display = 'none';
        this.setState({ awaitingClips: true });
    }

    playNextVideo(): void {
        const updatedClipIndex = this.state.clipIndex + 1;

        this.setState({
            clipIndex: updatedClipIndex,
        });
    }

    async updateList(): Promise<void> {
        const data = await this.fetchClips();
        const newClips = [...data];

        this.addNewClips(newClips);
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

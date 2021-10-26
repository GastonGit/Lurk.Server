import React from 'react';
import '../styles/VideoPlayer.css';

interface VideoState {
    addedClips: Array<string>;
    clips: Array<string>;
    currentClip: string | undefined;
    noClips: boolean;
    updateInterval: NodeJS.Timeout | undefined;
}

export default class VideoPlayer extends React.Component<unknown, VideoState> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            addedClips: [],
            clips: [],
            currentClip:
                'https://clips-media-assets2.twitch.tv/42179710588-offset-17644.mp4',
            noClips: false,
            updateInterval: undefined,
        };
        this.nextClip = this.nextClip.bind(this);
    }

    async fetchClips(): Promise<void> {
        fetch(process.env.REACT_APP_SERVER_URL || '')
            .then((res) => res.json())
            .then((data) => {
                const clips: string[] = [];
                data.forEach(function (clip: string) {
                    clips.push(clip);
                });
                this.setState({ clips: [...clips], addedClips: [...clips] });

                if (clips.length === 0) {
                    this.setState({ noClips: true });
                } else {
                    this.nextClip();
                }
            })
            .catch((err) => err);
    }

    updateList(): void {
        fetch(process.env.REACT_APP_SERVER_URL || '')
            .then((res) => res.json())
            .then((data) => {
                const newClips = [...data];
                for (let i = 0; i < newClips.length; i++) {
                    if (!this.state.addedClips.includes(newClips[i])) {
                        const clips = [...this.state.clips];
                        clips.push(newClips[i]);

                        const addedClips = [...this.state.addedClips];
                        addedClips.push(newClips[i]);

                        this.setState({
                            clips: clips,
                            addedClips: addedClips,
                        });
                    }
                }

                if (this.state.noClips) {
                    this.setState({ noClips: false });
                    this.nextClip();
                }
            })
            .catch((err) => err);
    }

    nextClip(): void {
        if (this.state.clips.length > 0) {
            (
                document.querySelector('.js-video__clip') as HTMLVideoElement
            ).style.display = 'block';
            const updatedArray = [...this.state.clips];
            const currentClip = updatedArray.shift();
            this.setState({
                currentClip: currentClip,
                clips: updatedArray,
            });
        } else {
            (
                document.querySelector('.js-video__clip') as HTMLVideoElement
            ).style.display = 'none';
            this.setState({ noClips: true });
        }
    }

    componentDidMount(): void {
        this.fetchClips().catch((err) => err);
        (
            document.querySelector('.js-video__clip') as HTMLVideoElement
        ).onended = () => {
            this.nextClip();
        };

        const updateInterval = setInterval(this.updateList.bind(this), 60000);
        this.setState({ updateInterval: updateInterval });

        (document.querySelector('.js-video__clip') as HTMLElement).onerror =
            () => {
                console.log(
                    'Error loading current clip, playing the next clip',
                );
                this.nextClip();
            };
    }

    componentWillUnmount(): void {
        clearInterval(this.state.updateInterval as NodeJS.Timeout);
    }

    render(): JSX.Element {
        if (!this.state.clips) {
            return <span>Loading...</span>;
        }

        return (
            <video
                className="js-video__clip"
                src={this.state.currentClip}
                autoPlay={true}
                controls
                muted
            />
        );
    }
}

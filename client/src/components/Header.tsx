import React from 'react';
import '../styles/Header.css';
import Grid from '@mui/material/Grid';

export default class Header extends React.Component<unknown, unknown> {
    render(): JSX.Element {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12}>
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
            </Grid>
        );
    }
}

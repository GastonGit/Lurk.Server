import React from 'react';
import '../styles/Footer.css';
import Grid from '@mui/material/Grid';

export default class Footer extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <footer className="Footer">
                    <a href="https://github.com/GastonGit/Hot-Twitch-Clips">
                        About
                    </a>
                </footer>
            </Grid>
        );
    }
}

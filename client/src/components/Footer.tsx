import React from 'react';
import '../styles/Footer.css';
import { Grid } from '@mui/material';

export default class Footer extends React.Component<unknown, unknown> {
    constructor(props: unknown) {
        super(props);
        this.state = {};
    }

    render(): JSX.Element {
        return (
            <div className="Footer">
                <div className="FooterContent">
                    <Grid container xs={12} sm={12} md={12} lg={12}>
                        <Grid item xs={4} sm={3} md={2}>
                            <a href="https://github.com/GastonGit/Hot-Twitch-Clips">
                                About
                            </a>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

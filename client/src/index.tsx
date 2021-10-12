import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Header from './components/Header';
import App from './components/App';
import Footer from './components/Footer';
import Grid from '@mui/material/Grid';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <Grid container className="RootGrid" direction="column" spacing={0}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Header />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <App />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <Footer />
            </Grid>
        </Grid>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

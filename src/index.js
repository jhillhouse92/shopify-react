import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './theme.liquid';


import HomeGreeting from './components/home_greeting';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <HomeGreeting />
        );
    }
}

ReactDOM.render(<App />, document.querySelector('.react-container-app'));

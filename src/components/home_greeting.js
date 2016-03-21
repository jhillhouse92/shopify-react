import React, { Component } from 'react';

class HomeGreeting extends Component {
    constructor(props){
        super(props);

        this.state = { message: this.getGreetingMessage() };
    }

    getGreetingMessage() {
        var d = new Date();
        var time = d.getHours();

        if (time < 12) {
            return 'Good morning';
        } else if (time === 12) {
            return 'Go eat lunch';
        }
        else {
            return 'Good afternoon';
        }

    }

    render() {
        return (
            <div className="home-greeting home-greeting-no-today-view">
                <div className="home-greeting__content">
                    <p className="home-greeting__heading">{this.state.message}, Joseph.</p>
                    <p className="home-greeting__body">Here's what's happening with your store right now.</p>
                    <p>You are on the { this.props.page } page!</p>
                </div>
            </div>
        );
    }
}

HomeGreeting.propTypes = { page: React.PropTypes.string };

export default HomeGreeting;

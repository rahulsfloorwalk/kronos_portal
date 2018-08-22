import React from "react";

import Header from "./Header.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";

import { fetchConfig } from "../service/config.js";

export default class extends React.Component {
    state = {
    	config: {},
    };

    componentDidMount() {
    	fetchConfig().then((config) => this.setState({config}));
    }

    render() {
    	var contentStyle = {
    		"minHeight": "600px"
    	};
    	return (
    		<div>
    			<DevelopmentMarker/>
    			<Header/>
    			<div className="container" style={contentStyle}>
    				{this.props.children}
    			</div>
    			<Footer config={this.state.config}/>
    		</div>
    	);
    }
}


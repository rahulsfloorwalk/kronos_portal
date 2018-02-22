import React from "react";
import PropTypes from "prop-types";

import Header from "./Header.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";

import { fetchConfig } from "../service/config.js";

export default class App extends React.Component{
	static propTypes = {
		//children: PropTypes.element,
	};

	constructor(props){
		super(props);
		this.state = {};
	}

	componentDidMount(){
		fetchConfig().then((config) => this.setState({config}));
	}

	render(){
		let contentStyle = {
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


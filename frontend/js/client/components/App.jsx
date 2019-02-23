import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

import Header from "./Header.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";

import { fetchConfig } from "../service/config.js";

class App extends React.Component {
	static propTypes = {
		location: PropTypes.object.isRequired,
		children: PropTypes.node,
	};

	state = {};

	componentDidMount() {
		fetchConfig().done((config) => this.setState({ config }));
	}

	render() {
		var contentStyle = {
			"minHeight": "600px"
		};
		return (
			<div>
				<Helmet>
					<title>{this.state.config ? this.state.config.BRAND_SHORTNAME : "" } Auditor Portal</title>
				</Helmet>
				<DevelopmentMarker/>
				<Header location={this.props.location}/>
				<div className="container-fluid" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer config={this.state.config}/>
			</div>
		);
	}
}

export default App;

import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import _ from "lodash";

import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";

import Header from "./Header.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";

import { fetchConfig } from "../service/config.js";

import favicon from "../../../img/favicon.png";

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
					<meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1"/>
					<link rel="icon" href={favicon} type="image/png" />
					<title>{_.get(this.state.config, "BRAND_SHORTNAME", "")} Client Portal</title>
				</Helmet>
				<DevelopmentMarker/>
				<Header location={this.props.location}/>
				<div className="container-fluid" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer config={this.state.config}/>
				<Alert stack={{limit: 5}} effect="slide"/>
			</div>
		);
	}
}

export default App;

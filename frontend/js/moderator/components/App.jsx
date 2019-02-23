import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import _ from "lodash";

import Header from "./Header.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";

import { fetchConfig } from "../service/config.js";

import favicon from "../../../img/favicon_64x64.png";

export default class App extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

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
				<Helmet>
					<meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1"/>
					<link rel="icon" href={favicon} type="image/png" />
					<title>{_.get(this.state.config, "BRAND_SHORTNAME", "")} Moderator Portal</title>
				</Helmet>
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


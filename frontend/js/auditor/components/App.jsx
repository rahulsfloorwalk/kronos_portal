import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import _ from "lodash";

import Alert from "react-s-alert";
import "react-s-alert/dist/s-alert-default.css";
import "react-s-alert/dist/s-alert-css-effects/slide.css";

import Header from "./Header.jsx";
import CollectBot from "./CollectBot.jsx";
import Footer from "../../components/Footer.jsx";
import DevelopmentMarker from "../../components/DevelopmentMarker.jsx";
import SiteTourBox from "./SiteTourBox.jsx";

import { fetchConfig } from "../service/config.js";

import favicon from "../../../img/favicon.png";

class App extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {};

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
					<title>{_.get(this.state.config, "BRAND_SHORTNAME", "")} Auditor Portal</title>
				</Helmet>
				<CollectBot collectId={_.get(this.state.config, "COLLECTCDN_ID", undefined)}/>
				<DevelopmentMarker/>
				<Header/>
				<div className="container" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer config={this.state.config}/>
				<Alert stack={{limit: 1}} effect="slide" timeout={2000} />
				<SiteTourBox />
			</div>
		);
	}
}

export default App;

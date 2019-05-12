import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

export default class CollectBot extends React.Component {
	static propTypes = {
		collectId: PropTypes.string,
	};

	render(){
		if(!this.props.collectId) {
			return null;
		}
		const url = "https://collectcdn.com/launcher.js";
		window.CollectId = this.props.collectId;
		return (<Helmet><script src={url} type="text/javascript"/></Helmet>);
	}
}

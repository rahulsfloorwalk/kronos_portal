import React from "react";
import PropTypes from "prop-types";

import loadingImageUrl from "../../img/ripple.svg";

export default class Loading extends React.Component {
	static propTypes = {
		loading_text: PropTypes.string,
	};
	render() {
		return (
			<div className="text-center text-muted">
				<img src={loadingImageUrl} title="Please Wait" alt="loading..."/>
				<p>{this.props.loading_text ? this.props.loading_text : "LOADING"}</p>
			</div>
		);
	}
}

import React from "react";

import loadingImageUrl from "../../img/ripple.svg";

export default class Loading extends React.Component {
	render() {
		return (
			<div className="text-center text-muted">
				<img src={loadingImageUrl} title="Please Wait" alt="loading..."/>
				<p>LOADING</p>
			</div>
		);
	}
}

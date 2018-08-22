import React from 'react';

const loadingImageUrl = "/static/img/ripple.svg";

class Loading extends React.Component {
    render() {
		return (
			<div className="text-center text-muted">
				<img src={loadingImageUrl} title="Please Wait" alt="loading..."/>
				<p>LOADING</p>
			</div>
		);
	}
}

export default Loading;

export { loadingImageUrl };

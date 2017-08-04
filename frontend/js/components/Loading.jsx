import React from 'react';

const loadingImageUrl = "/static/img/ripple.svg";

var Loading = React.createClass({
	render: function(){
		return (
			<div className="text-center text-muted">
				<img src={loadingImageUrl} title="Please Wait" alt="loading..."/>
				<p>LOADING</p>
			</div>
		);
	},
});

export default Loading;

export { loadingImageUrl };

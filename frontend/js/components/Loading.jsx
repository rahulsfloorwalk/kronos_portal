import React from 'react';

var Loading = React.createClass({
	render: function(){
		return (
			<div className="text-center text-muted">
				<img src="/static/img/ripple.svg" title="Please Wait" alt="loading..."/>
				<p>LOADING</p>
			</div>
		);
	},
});

export default Loading;

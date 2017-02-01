import React from 'react';

export default React.createClass({
	render: function(){
		return (
			<span className="badge">{this.props.children}</span>
		);
	},
});

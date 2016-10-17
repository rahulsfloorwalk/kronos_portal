import React from 'react';

var Check = React.createClass({
	render: function(){
		return (
			<span className="glyphicon glyphicon-ok"></span>
		);
	},
});


var Cross = React.createClass({
	render: function(){
		return (
			<span className="glyphicon glyphicon-remove"></span>
		);
	},
});

export { Check, Cross };

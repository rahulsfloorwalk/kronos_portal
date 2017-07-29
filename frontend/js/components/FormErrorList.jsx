import React from 'react';

var FormErrorList = React.createClass({
	render : function(){
		var errors = this.props.errors || [];
		var items = [];
		for( var error of errors){
			items.push(<li key={error} style={{"color": "red"}}>{error}</li>);
		}
		return (
			<ul>
				{items}
			</ul>
		);
	},
});

export default FormErrorList;

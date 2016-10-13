import React from 'react';

var FormInputError = React.createClass({
	render : function(){
		var errors = this.props.errors || [];
		var items = [];
		for( var error of errors){
			items.push(<li key={error}>{error}</li>);
		}
		return (
			<ul>
				{items}
			</ul>
		);
	},
});

export default FormInputError;

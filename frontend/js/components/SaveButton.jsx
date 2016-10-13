import React from 'react';

var SaveButton = React.createClass({
	render : function(){
		return (
			<button type="submit" className="btn btn-primary" {...this.props}>
				Save
			</button>
		);
	},
});

export default SaveButton;

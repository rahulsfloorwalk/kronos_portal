import React from 'react';

var SaveButton = React.createClass({
	render : function(){
		let text = this.props.text || "Save";
		return (
			<button type="submit" className="btn btn-primary">
				{text}
			</button>
		);
	},
});

export default SaveButton;

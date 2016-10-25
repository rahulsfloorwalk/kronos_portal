import React from 'react';

var SaveButton = React.createClass({
	render : function(){
		var text = this.props.text || "Save";
		return (
			<button type="submit" className="btn btn-primary" {...this.props}>
				{text}
			</button>
		);
	},
});

export default SaveButton;

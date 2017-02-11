import React from 'react';

import Modal from './Modal.jsx';

export default React.createClass({
	getInitialState: function(){
		return {
			expanded: false
		};
	},
	buttonClicked : function(){
		this.setState({
			expanded: ! this.state.expanded
		});
	},
	render: function(){
		let pointerStyle = {cursor: 'pointer'};
		var buttonText = this.state.expanded ? "Hide Details" : "View Details";
		var details = this.state.expanded ? 
			(<Modal size="modal-lg" modalTitle="Details" onClose={this.buttonClicked}>
				<pre>{this.props.details}</pre>
			</Modal>)
			: null;
		return (
			<div>
				<a style={pointerStyle} onClick={this.buttonClicked}>{buttonText}</a>
				{details}
			</div>
		);
	}
});

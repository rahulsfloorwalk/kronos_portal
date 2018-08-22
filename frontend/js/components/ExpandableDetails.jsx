import React from 'react';

import Modal from './Modal.jsx';

export default class extends React.Component {
    state = {
        expanded: false
    };

    buttonClicked = () => {
		this.setState({
			expanded: ! this.state.expanded
		});
	};

    render() {
		let pointerStyle = {cursor: 'pointer'};
		var buttonText = this.state.expanded ? "Hide Details" : "View Details";
		var details = this.state.expanded ? 
			(<Modal size="modal-lg" modalTitle="Details" onClose={this.buttonClicked}>
				<div>
				{this.props.details}
				</div>
			</Modal>)
			: null;
		return (
			<span>
				<a style={pointerStyle} onClick={this.buttonClicked}>{buttonText}</a>
				{details}
			</span>
		);
	}
}

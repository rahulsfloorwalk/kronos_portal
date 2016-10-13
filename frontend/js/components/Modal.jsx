import React from 'react';

var Modal = React.createClass({
	render : function(){
		var modalStyle = {
			display: 'block'
		};
		var modalBackdropStyle = {
			zIndex: '1060',
			height: '100%'
		};
		var modalDialogStyle = {
			zIndex: '1070',
		};
		return (
			<div className="modal" tabIndex="-1" style={modalStyle}>
				<div className="modal-backdrop fade in" style={modalBackdropStyle} onClick={this.props.onClose}/>
				<div className="modal-dialog" style={modalDialogStyle}>
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" onClick={this.props.onClose}>&times;</button>
							<h4 className="modal-title">{this.props.modalTitle}</h4>
						</div>
						<div className="modal-body">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		);
	},
});

export default Modal;

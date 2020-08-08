import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Modal from "../../components/Modal.jsx";

import { submitConcern } from "../service/payment.js";

class PaymentConcern extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			paymentId: PropTypes.string.isRequired,
		}),
	};

	constructor(props){
		super(props);
		this.state = {
			message : "",
			error_message : "",
			success_message: null
		};
	}

	concernChanged = (e) => {
		this.setState({
			message : e.target.value,
			error_message : ""
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		if(this.state.message === ""){
			this.setState({
				error_message : "Please enter your concern"
			});
		}
		else{
			submitConcern(this.props.params.paymentId, this.state.message).then(()=>{
				this.setState({
					message: "",
					success_message : "Thank you for your concern, We will get back to you soon."
				});
				setTimeout(this.closeModal, 2000);
			});
		}
	};

	closeModal = () => {
		hashHistory.goBack();
	};

	render(){
		return (
			<Modal modalTitle="Concern About the Payment?" onClose={this.closeModal}>
				{
					this.state.success_message ?
						<div className="form-group">
							<span style={{color:"green", fontSize: "18px"}}><b>{this.state.success_message}</b></span>
							<br/>
							<br/>
							<button type="button" onClick={this.closeModal} className="btn btn-default">Close</button>
						</div>
						:
						<form onSubmit={this.onSubmit}>
							<p>If you have any <b>Concern</b> about this payment, you can write here.</p>
							<textarea rows="5" className="form-control" value={this.state.message} maxLength="4096" onChange={this.concernChanged}/>
							<span style={{color:"red"}}><b>{this.state.error_message}</b></span>
							<br/>
							<div className="form-group">
								<button type="submit" className="btn btn-primary">Submit</button>
								&nbsp;&nbsp;
								<button type="button" onClick={this.closeModal} className="btn btn-default">Close</button>
							</div>
						</form>
				}
			</Modal>
		);
	}
}
export default PaymentConcern;
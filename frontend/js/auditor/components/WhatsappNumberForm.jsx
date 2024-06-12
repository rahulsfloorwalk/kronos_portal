import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

import { setWhatsappNumber } from "../actions/profile_info.js";

import { affectInputEventToComponent } from "../../react_utils.js";
import FormInput from "../../components/FormInput.jsx";
import { Save } from "../../components/Icons.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";
import { fetchProfileInfo } from "../actions/dashboard.js";
import FormSelect from "../../components/FormSelect.jsx";
import { countryDialCodes } from "../../constants.js";


class WhatsappNumberForm extends Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		router: PropTypes.shape({
			push: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}).isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			whatsapp_number: "",
			submitting: false,
			errors: {},
			dialcode: "+91",
		};
	}
	componentDidMount() {
		this.props.dispatch(fetchProfileInfo())
			.then((profileInfo) => {
				this.setState({ whatsapp_number: profileInfo.whatsapp_number, dialcode: profileInfo.whatsapp_dial_code ? profileInfo.whatsapp_dial_code : this.state.dialcode });
			});
	}
	setSubmitting = (submitting) => {
		this.setState((prevState) => Object.assign({}, prevState, { submitting }));
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		this.props.dispatch(setWhatsappNumber(this.state.whatsapp_number,this.state.dialcode)).then(() => {
			this.props.router.push("/details");
		}, (err) => {
			this.setState({
				errors: err && err.responseJSON,
			});
		}).always(() => this.setSubmitting(false));
	};

	render(){
		return (
			<Modal modalTitle="Update Whatsapp Number" onClose={this.props.router.goBack}>
				<form onSubmit={this.onSubmit}>
					{typeof(this.state.errors.non_field_errors) != "undefined" ? <FormErrorList errors={this.state.errors.non_field_errors}/> : null }
					<div className="row">
						<div className="col-md-3">
							<FormSelect label="Dial code" required_mark={true} name="dialcode" value={this.state.dialcode} onChange={this.inputChanged} disabled={this.state.submitting}>
								{countryDialCodes.map(item => (
									<option value={item.dialcode} key={item.id}>{item.name}</option>
								))}

							</FormSelect>
						</div>
						<div className="col-md-9">
							<FormInput label="Whatsapp Number (10-digit)" placeholder=""
								maxLength="20"
								type="text" required={true}
								value={this.state.whatsapp_number}
								name="whatsapp_number" onChange={this.inputChanged}
								errors={this.state.errors.whatsapp_number}
								disabled={this.state.submitting}/>
						</div>
					</div>
					<div className="form-group">
						<button className="btn btn-lg btn-primary" disabled={this.state.submitting}>
							{ !this.state.submitting ? <span><Save/> Save</span> : "saving..."}
						</button>
					</div>
				</form>
			</Modal>
		);
	}
}

export default ReactRedux.connect()(WhatsappNumberForm);

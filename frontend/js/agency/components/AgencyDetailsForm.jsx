import React from "react";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";

import { fetchAgency, saveAgency } from "../service/details.js";

import FormInput from "../../components/FormInput.jsx";
import SaveButton from "../../components/SaveButton.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

export default class AgencyDetailsForm extends React.Component {

	static propTypes = {
		dispatch: PropTypes.func,
		router: PropTypes.shape({
			push: PropTypes.func,
		}),
		bankInfo: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			form: {},
			errors: {},
			loading: true,
			saving: false,
		};
	}

	componentDidMount() {
		this.setLoading(true);
		fetchAgency().then((details) => this.setState({form: details})).finally(() => this.setLoading(false));
	}

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));
	setSaving = (saving) => this.setState((prevState) => Object.assign({}, prevState, { saving }));

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, {
				[e.target.name] : e.target.value,
			})
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.setSaving(true);
		saveAgency(this.state.form).then(() => {
			this.props.router.push("/");
		}, (errors) => {
			this.setState({
				errors: errors.responseJSON || {},
			});
			this.setSaving(false);
		});
	};

	render(){
		return (
			<Modal modalTitle="Edit Company Details" onClose={hashHistory.goBack}>
				{/*<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to apply to audits</i></big></div>*/}
				{ this.state.loading ?
					<Loading/>
					:
					<form onSubmit={this.onSubmit}>
						<h4 className="">General Details</h4>
						<div className="row">
							<div className="col-md-6">
								<FormInput label="Company Name" maxLength="50" type="text"
									value={this.state.form.name}
									name="name" onChange={this.inputChanged}
									errors={this.state.errors.name}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Formed in Year" max={new Date().getFullYear()} type="number"
									value={this.state.form.formed_in_year}
									name="formed_in_year" onChange={this.inputChanged}
									errors={this.state.errors.formed_in_year}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="CIN" maxLength="21" type="text"
									value={this.state.form.cin}
									name="cin" onChange={this.inputChanged}
									errors={this.state.errors.cin}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Company Workforce Strength" type="number"
									value={this.state.form.strength}
									name="strength" onChange={this.inputChanged}
									errors={this.state.errors.strength}
									readOnly={this.state.saving}/>
							</div>
						</div>
						<h4 className="">Financial Details</h4>
						<div className="row">
							<div className="col-md-6">
								<FormInput label="GSTIN" maxLength="15" type="text"
									value={this.state.form.gstin}
									name="gstin" onChange={this.inputChanged}
									errors={this.state.errors.gstin}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Bank Branch IFSC Code" maxLength="20" type="text"
									value={this.state.form.ifsc_code}
									name="ifsc_code" onChange={this.inputChanged}
									errors={this.state.errors.ifsc_code}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Bank Account Name" maxLength="40" type="text"
									value={this.state.form.account_holder_name}
									name="account_holder_name" onChange={this.inputChanged}
									errors={this.state.errors.account_holder_name}
									readOnly={this.state.saving}/>
							</div>
							<div className="col-md-6">
								<FormInput label="Bank Account Number" maxLength="20" type="text"
									value={this.state.form.account_number}
									name="account_number" onChange={this.inputChanged}
									errors={this.state.errors.account_number}
									readOnly={this.state.saving}/>
							</div>
						</div>
						<SaveButton/>
					</form>
				}
			</Modal>
		);
	}
}


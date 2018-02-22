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
			<Modal modalTitle="Edit Bank Info" onClose={hashHistory.goBack}>
				<div className="form-group"><big><i>fields marked <b>✳</b> must be filled to apply to audits</i></big></div>
				{ this.state.loading ?
					<Loading/>
					:
					<form onSubmit={this.onSubmit}>
						<FormInput label="Agency Name" maxLength="50" type="text"
							value={this.state.form.name}
							name="name" onChange={this.inputChanged}
							errors={this.state.errors.name}
							readOnly={this.state.saving}/>
						<FormInput label="Formed in Year" max={new Date().getFullYear()} type="number"
							value={this.state.form.formed_in_year} 
							name="formed_in_year" onChange={this.inputChanged} 
							errors={this.state.errors.formed_in_year} 
							readOnly={this.state.saving}/>
						<FormInput label="GSTIN" maxLength="15" type="text"
							value={this.state.form.gstin}
							name="gstin" onChange={this.inputChanged} 
							errors={this.state.errors.gstin}
							readOnly={this.state.saving}/>
						<FormInput label="CIN" maxLength="21" type="text"
							value={this.state.form.cin}
							name="cin" onChange={this.inputChanged}
							errors={this.state.errors.cin}
							readOnly={this.state.saving}/>
						<FormInput label="Company Workforce Strength" type="number"
							value={this.state.form.strength}
							name="strength" onChange={this.inputChanged}
							errors={this.state.errors.strength}
							readOnly={this.state.saving}/>
						<SaveButton/>
					</form>
				}
			</Modal>
		);
	}
}


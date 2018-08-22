import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import { fetchAuditorPreferences, savePreferences } from "../../service/preferences.js";

import { Save } from "../../../components/Icons.jsx";
import FormErrorList from "../../../components/FormErrorList.jsx";
import Modal from "../../../components/Modal.jsx";
import Loading from "../../../components/Loading.jsx";

export default class PreferencesForm extends React.Component{
	static propTypes = {
		params: PropTypes.shape({
			auditorId: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.number,
			]).isRequired
		})
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			errors: {},
			form: {},
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, {loading}));

	componentDidMount() {
		this.setLoading(true);
		fetchAuditorPreferences(this.props.params.auditorId).done((preferences) => {
			this.setState({form: preferences});
		}).always(() => this.setLoading(false));
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, {
				[e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
			})
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		savePreferences(this.props.params.auditorId, this.state.form).done(() => {
			hashHistory.goBack();
		}).fail((err)=>{
			this.setState({errors: err.responseJSON || {}});
		});
	};

	render(){
		return (
			<Modal modalTitle="Change Preferences" onClose={hashHistory.goBack}>
				{ ! this.state.loading ?
					<form onSubmit={this.onSubmit}>
						<FormErrorList errors={this.state.errors.non_field_errors}/>
						<big><b>Receive New Opportunities:</b></big>
						<div className="form-group">
							<label className="control-label" style={{"display":"flex", "alignItems":"center"}}>
								<input type="checkbox" name="receive_new_opportunities_email"
									style={{"width": "30px", "height": "30px"}}
									onChange={this.inputChanged}
									checked={this.state.form.receive_new_opportunities_email}/>
								&nbsp;On Email?
							</label>
						</div>
						<div className="form-group">
							<label className="control-label" style={{"display":"flex", "alignItems":"center"}}>
								<input type="checkbox" name="receive_new_opportunities_sms"
									style={{"width": "30px", "height": "30px"}}
									onChange={this.inputChanged}
									checked={this.state.form.receive_new_opportunities_sms} />
								&nbsp;On SMS?
							</label>
						</div>
						<div className="form-group">
							<button className="btn btn-primary btn-lg">
								<Save/> Save
							</button>
						</div>
					</form>
					: <Loading/> }
			</Modal>
		);
	}
}


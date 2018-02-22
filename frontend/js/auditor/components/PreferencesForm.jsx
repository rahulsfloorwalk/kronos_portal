import React from "react";
import { hashHistory } from "react-router";

import { fetchPreferences, savePreferences } from "../service/preferences.js";

import { Save } from "../../components/Icons.jsx";
import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

export default class PreferencesForm extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loading: false,
			errors: {},
			preferences: null,
		};
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, {loading}));

	componentDidMount() {
		this.setLoading(true);
		fetchPreferences().done((preferences) => {
			this.setState({preferences});
		}).always(() => this.setLoading(false));
	}

	inputChanged = (e) => {
		this.setState({
			preferences: Object.assign({}, this.state.preferences, {
				[e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
			})
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		savePreferences(this.state.preferences).done(() => {
			hashHistory.goBack();
		}).fail((err)=>{
			this.setState({errors: err.responseJSON || {}});
		});
	};

	render(){
		return (
			<Modal modalTitle="Change Preferences" onClose={hashHistory.goBack}>
				{ ! this.state.loading && this.state.preferences ?
					<form onSubmit={this.onSubmit}>
						<FormErrorList errors={this.state.errors.non_field_errors}/>
						<big><b>Receive New Opportunities:</b></big>
						<div className="form-group">
							<label className="control-label" style={{"display":"flex", "alignItems":"center"}}>
								<input type="checkbox" name="receive_new_opportunities_email"
									style={{"width": "30px", "height": "30px"}}
									onChange={this.inputChanged}
									checked={this.state.preferences.receive_new_opportunities_email}/>
								&nbsp;On Email?
							</label>
						</div>
						<div className="form-group">
							<label className="control-label" style={{"display":"flex", "alignItems":"center"}}>
								<input type="checkbox" name="receive_new_opportunities_sms"
									style={{"width": "30px", "height": "30px"}}
									onChange={this.inputChanged}
									checked={this.state.preferences.receive_new_opportunities_sms} />
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


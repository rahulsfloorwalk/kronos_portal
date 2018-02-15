import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { fetchAuditorPreferences } from "../../../manager/service/preferences.js";
import { Check, Cross } from "../../Icons.jsx";
import Loading from "../../Loading.jsx";

export default class AuditorPreferencesPanel extends React.Component{
	static propTypes = {
		auditorId: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.number,
		]).isRequired
	};

	constructor(props){
		super(props);
		this.state = {
			preferences: null,
		};
	}

	componentDidMount() {
		fetchAuditorPreferences(this.props.auditorId).done(preferences => {
			this.setState({ preferences });
		});
	}
	componentWillReceiveProps(nextProps) {
		fetchAuditorPreferences(nextProps.auditorId).done(preferences => {
			this.setState({ preferences });
		});
	}

	render(){
		if(! this.state.preferences){
			return <Loading/>;
		}
		let receive_new_opportunities_email = this.state.preferences.receive_new_opportunities_email ? <Check/> : <Cross/>;
		let receive_new_opportunities_sms = this.state.preferences.receive_new_opportunities_sms ? <Check/> : <Cross/>;
		let receive_transactional_email = this.state.preferences.receive_transactional_email ? <Check/> : <Cross/>;
		let receive_transactional_sms = this.state.preferences.receive_transactional_sms ? <Check/> : <Cross/>;
		let pp_accepted = this.state.preferences.pp_accepted ? <Check/> : <Cross/>;
		let agreement_accepted = this.state.preferences.agreement_accepted ? <Check/> : <Cross/>;

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<Link className="pull-right" to={`/auditor/${this.props.auditorId}/details/preferences/edit`}>change</Link>
					<h3 className="panel-title">Preferences</h3>
				</div>
				<div className="panel-body">
					<p>Receive New Opportunities:</p>
					<ul style={{"listStyleType": "none"}}>
						<li>{ receive_new_opportunities_email } on Email</li>
						<li>{ receive_new_opportunities_sms } on SMS</li>
					</ul>
					<p>Receive Transactional Email:</p>
					<ul style={{"listStyleType": "none"}}>
						<li>{ receive_transactional_email } on Email</li>
						<li>{ receive_transactional_sms } on SMS</li>
					</ul>
					<p>Privacy Policy Accepted : { pp_accepted }</p>
					<p>Agreement Accepted: { agreement_accepted }</p>
				</div>
			</div>
		);
	}
}

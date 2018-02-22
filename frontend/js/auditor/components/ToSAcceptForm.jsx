import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { tosAccept } from "../service/preferences.js";
import { fetchConfig } from "../service/config.js";

import FormErrorList from "../../components/FormErrorList.jsx";
import Modal from "../../components/Modal.jsx";
import Loading from "../../components/Loading.jsx";

class ToSAcceptForm extends Component{

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		router: PropTypes.shape({
			replace: PropTypes.func.isRequired,
			goBack: PropTypes.func.isRequired,
		}),
		location: PropTypes.shape({
			query: PropTypes.object.isRequired,
		})
	};

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			submitting: false,
			errors: {},
			config: {},
		};
	}

	componentDidMount(){
		this.setLoading(true);
		fetchConfig().then(config => {
			this.setState({ config });
		}).always(() => this.setLoading(false));
	}

	setSubmitting = (submitting) => this.setState((prevState) => Object.assign({}, prevState, { submitting }));

	setLoading = (loading) => this.setState((prevState) => Object.assign({}, prevState, { loading }));

	onSubmit = (e) => {
		e.preventDefault();
		this.setSubmitting(true);
		tosAccept(true).then(() => {
			if(this.props.location && this.props.location.query.auditCycleId && this.props.location.query.auditId){
				let { auditId, auditCycleId } = this.props.location.query;
				this.props.router.replace(`/audit/cycle/${auditCycleId}/audit/${auditId}/apply`);
			}
		}, (err) => {
			this.setState({
				errors: err && err.responseJSON,
			});
		}).always(() => this.setSubmitting(false));
	};

	render(){
		return (
			<Modal modalTitle="Accept Privacy Policy" onClose={this.props.router.goBack}>
				{ this.state.loading ? <Loading/> :
					<form onSubmit={this.onSubmit}>
						<p><big>You must to accept the <a href={`${this.state.config.RHEA_BASE_URL}/privacy_policy`} target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href={`${this.state.config.RHEA_BASE_URL}/contractor_agreement`} target="_blank" rel="noopener noreferrer">Independent Contractor Agreement</a> before you can conduct audits for FloorWalk.</big></p>
						<p>Click the button below to accept.</p>
						<FormErrorList errors={this.state.errors.non_field_errors}/>
						<div className="form-group">
							<button className="btn btn-lg btn-block btn-success" disabled={this.state.submitting}>
								{ !this.state.submitting ? <span>I Accept</span> : "accepting..."}
							</button>
						</div>
					</form>
				}
			</Modal>
		);
	}
}

export default connect()(ToSAcceptForm);

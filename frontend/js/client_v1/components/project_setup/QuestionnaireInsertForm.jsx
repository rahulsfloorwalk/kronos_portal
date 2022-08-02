import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";

import { Plus } from "../../../components/Icons.jsx";

import { fetchSampleQuestionnaires, insertSampleQuestionnaire } from "../../service/questionnaire.js";
import QuestionnairePreview from "../questionnaire/QuestionnairePreview.jsx";
import Loading from "../../../components/Loading.jsx";

class QuestionnaireInsertForm extends React.Component{
	static propTypes = {
		quotation: PropTypes.object,
		clientId: PropTypes.number,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
		}).isRequired,
	};

	state = {
		loading: false,
		questionnaire: "",
		errors: {},
	};

	componentDidMount(){
		if(Object.keys(this.props.quotation).length > 0){
			fetchSampleQuestionnaires(this.props.quotation.sample_questionnaire_type.id).then((questionnaire) => {
				this.setState({
					questionnaire,
					loading: false,
					errors: {},
				});
			}, (errors) => {
				this.setState({
					loading: false,
					errors: errors.responseJSON || {},
				});
			});
		}
	}

	componentWillReceiveProps(ownProps){
		if(ownProps.quotation !== this.props.quotation){
			fetchSampleQuestionnaires(ownProps.quotation.sample_questionnaire_type.id).then((questionnaire) => {
				this.setState({
					questionnaire,
					loading: false,
					errors: {},
				});
			}, (errors) => {
				this.setState({
					loading: false,
					errors: errors.responseJSON || {},
				});
			});
		}
	}

	onInsertQuestionnaire = () => {
		let text = "Are you sure to continue?";
		if (confirm(text) == false) {
			return false;
		}
		insertSampleQuestionnaire(this.props.params.auditCycleId, this.state.questionnaire.id).then(() => {
			Alert.success("Questionnaire inserted");
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		}, (errors)=> {
			let error = errors.responseJSON || {};
			Alert.warning(error.non_field_errors[0]);
			hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
		});
	};

	render(){

		return(
			<div className="panel panel-default">
				<div className="panel-heading">
					<div className="pull-right">
						<button className="btn btn-default" onClick={this.onInsertQuestionnaire}>
							<Plus/> Insert questionnaire
						</button>
					</div>
					<h5><b>Preview / Insert Questionnaire</b></h5>
				</div>
				<div className="panel-body">
					{this.state.loading ? <Loading /> : null}
					{this.state.questionnaire ?
						<QuestionnairePreview sampleQuestionnaire={this.state.questionnaire} auditCycleId={this.props.params.auditCycleId} />
						: null}
					{this.state.questionnaire ?
						<div className="col-md-12 text-center">
							<button className="btn btn-default" onClick={this.onInsertQuestionnaire}>
								<Plus/> Insert questionnaire
							</button><br/><br/>
						</div>
						: null }
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		quotation: store.quotation || {},
	};
};

export default connect( mapStoreToProps)(QuestionnaireInsertForm);
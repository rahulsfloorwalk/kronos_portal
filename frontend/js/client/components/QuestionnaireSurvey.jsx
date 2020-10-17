import React from "react";
import PropTypes from "prop-types";
import { url } from "../../../config.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Download } from "../../components/Icons.jsx";


import {fetchQuestionnaireSurveyByAuditCycleId} from "../service/dashboard.js";

export default class QuestionnaireSurvey extends React.Component{
	static propTypes = {
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			start_date: PropTypes.string.isRequired,
			end_date: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		data: [],
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (questionnaireTypeId, auditCycleId) => {
		this.setLoading(true);
		fetchQuestionnaireSurveyByAuditCycleId(questionnaireTypeId, auditCycleId).then((QuestionnaireSurveyQuestions) => {
			this.setState({
				data: QuestionnaireSurveyQuestions,
			});
		}).always( () => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData(this.props.questionnaireType.id, this.props.auditCycle.id);
	}

	componentWillReceiveProps(nextProps){
		//console.log("AuditCycleTimeSeries","componentWillReceiveProps", nextProps.questionnaireType);
		if(this.props.auditCycle !== nextProps.auditCycle) {
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
		if( this.props.questionnaireType !== nextProps.questionnaireType) {
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
	}

	render(){
		let questionnaire_survey_questions;
		let download_button;
		if(this.state.loading){
			questionnaire_survey_questions = <Loading/>;
		}
		else if(this.state.data.length <= 0 ){
			questionnaire_survey_questions = <Jumbotron heading="there are no options in questionnaire of this audit cycle" para=""/>;
		} else {
			let base_url = url.api_base_path+"client/audit_cycle_questionnaire_survey_xlsx?";
			base_url += "auditCycleId=" + encodeURIComponent(this.props.auditCycle.id || "");
			base_url += "&questionnaireTypeId=" + encodeURIComponent(this.props.questionnaireType.id || "");
			download_button = (<a className="btn btn-default pull-right" href={base_url} >Download <Download/></a>);
			let rows = [];
			for(let q of this.state.data){
				if (q.type == "question"){
					let option_data = [];
					let option_key = 0;
					for(let option_val of q["options_list"]){
						option_data.push(<span key={option_key}><b>{option_val["option_name"]}</b> - {option_val["percentage"]}% <br/></span>);
						option_key += 1;
					}
					rows.push(
						<tr key={q.question_id}>
							<td>{q.question_txt}</td>
							<td>{option_data}</td>
						</tr>
					);
				}
				else{
					rows.push(
						<tr key={q.section_id} style={{backgroundColor: "#f9f9f9"}}>
							<td colSpan="2"><b>{q.section_name}</b></td>
						</tr>
					);
				}
			}
			questionnaire_survey_questions = (
				<table className="table table-bordered table-hover">
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		}
		return (
			<div>
				{download_button}
				<h3 className="text-center">Question Summary</h3>
				<div>
					{questionnaire_survey_questions}
				</div>
			</div>
		);
	}
}

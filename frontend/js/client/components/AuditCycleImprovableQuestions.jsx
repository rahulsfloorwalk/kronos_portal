import React from "react";
import PropTypes from "prop-types";
import { url } from "../../../config.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import { Download } from "../../components/Icons.jsx";

import { getColorbyValue } from "../../utils.js";

import {fetchImrovableQuestionsByAuditCycleId} from "../service/dashboard.js";

export default class AuditCycleImprovableQuestions extends React.Component{
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
		fetchImrovableQuestionsByAuditCycleId(questionnaireTypeId, auditCycleId).then((ImprovableQuestions) => {
			this.setState({
				data: ImprovableQuestions,
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
		let improvable_question;
		let download_button;
		if(this.state.loading){
			improvable_question = <Loading/>;
		}
		else if(this.state.data.length <= 0 ){
			improvable_question = <Jumbotron heading="there are no improvable questions in this audit cycle" para=""/>;
		} else {
			let base_url = url.api_base_path+"client/audit_cycle_improvable_questions_xlsx?";
			base_url += "auditCycleId=" + encodeURIComponent(this.props.auditCycle.id || "");
			base_url += "&questionnaireTypeId=" + encodeURIComponent(this.props.questionnaireType.id || "");
			download_button = (<a className="btn btn-default pull-right" href={base_url} >Download <Download/></a>);
			let rows = [];
			for(let q of this.state.data){
				rows.push(
					<tr key={q.question_id}>
						<td>{q.question_section}</td>
						<td>{q.question_txt}</td>
						<td className="text-right"><b>{q.obtained_marks} / {q.total_marks}</b></td>
						<td className="text-right" style={{backgroundColor:getColorbyValue(q.percentage)}}><b>{q.lost_marks}</b></td>
					</tr>
				);
			}
			improvable_question = (
				<table className="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th>Section</th>
							<th>Question</th>
							<th className="text-right">Obtained Marks / Total Marks</th>
							<th className="text-right">Marks Lost</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		}
		return (
			<div>
				{download_button}
				<h3 className="text-center">Improvable Questions</h3>
				<div style={{overflowY:"auto", maxHeight:"400px"}}>
					{improvable_question}
				</div>
			</div>
		);
	}
}

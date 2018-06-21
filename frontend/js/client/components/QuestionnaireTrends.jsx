import React, { Component } from "react";
import PropTypes from "prop-types";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

import { getColor } from "../../utils.js";

import { fetchStoreMarkingTrends } from "../service/store.js";

export default class QuestionnaireTrends extends Component{
	static propTypes = {
		storeId: PropTypes.number.isRequired,
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
	};

	state = {};

	reloadReport = (storeId, questionnaireTypeId) => {
		fetchStoreMarkingTrends(storeId, questionnaireTypeId).then((data)=>{
			this.setState({
				data,
			});
		});
	};

	componentDidMount() {
		this.reloadReport(this.props.storeId, this.props.questionnaireType.id);
	}

	componentWillReceiveProps(nextProps) {
		this.reloadReport(nextProps.storeId, nextProps.questionnaireType.id);
	}

	render(){
		if(!this.state.data){
			return <Loading/>;
		}

		let rows = [];
		let prevSection;
		for(let score of this.state.data.scores) {
			if(score.scores.length === this.state.data.audit_cycle.length && score.max_marks > 0 ){
				rows.push(
					<tr key={score.question_id}>
						<td className="text-right">{prevSection !== score.section_name ? score.section_sequence : null}</td>
						<td>{prevSection !== score.section_name ? score.section_name : null}</td>
						<td>{score.question_txt}</td>
						{score.scores.map((s,i) => <td key={i} className={getColor(s.color) + " text-right"}>{parseFloat(s.marks) ? s.marks.toFixed(2) : s.marks}</td>)}
						<td className="text-right">{score.max_marks}</td>
					</tr>
				);
				prevSection=score.section_name;
			}
		}

		let table;
		if( rows.length > 0) {
			let cycles = [];
			for(let ac of this.state.data.audit_cycle){
				cycles.push(<th key={ac} className="text-right">{ac}</th>);
			}
			table = (
				<table className="table table-striped table-bordered table-hover">
					<thead>
						<tr>
							<th className="text-right">#</th>
							<th>Section</th>
							<th>Question</th>
							{cycles}
							<th className="text-right">Max. Marks</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		} else {
			table = (<Jumbotron heading="there is no data here" para=""/>);
		}
		return(
			<div>
				<h3 className="page-header">
					Score Performance Details
				</h3>
				{table}
			</div>
		);
	}
}

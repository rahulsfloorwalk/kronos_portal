import React, { Component } from "react";
import PropTypes from "prop-types";

import Datetime from "react-datetime";

import Jumbotron from "../../../components/Jumbotron.jsx";
import { EyeOpen, Unchecked } from "../../../components/Icons.jsx";
import { sectionPropType } from "../../prop_types";

import { orderKeys } from "../../../react_utils.js";

class AnswerComment extends Component {
	static propTypes = {
		answer_comment: PropTypes.string,
		question_id: PropTypes.number,
		editable: PropTypes.bool,
	};
	constructor(props){
		super(props);
		this.state = {
			answer_comment: this.props.answer_comment || ""
		};
	}

	render(){
		if(this.props.editable){
			return (
				<div>
					<textarea className="form-control" value={this.state.answer_comment} placeholder="optional comment" rows="1"/>
				</div>
			);
		} else {
			return this.props.answer_comment ? <span> ( {this.props.answer_comment})</span> : null;
		}
	}
}

class QuestionRow extends React.Component {
	static propTypes = {
		q: PropTypes.shape({
			id: PropTypes.number.isRequired,
			sequence: PropTypes.number.isRequired,
			max_marks: PropTypes.number.isRequired,
			question_type: PropTypes.string.isRequired,
			question_txt: PropTypes.string.isRequired,
			hide_question: PropTypes.bool,
			question_data: PropTypes.shape({
				options: PropTypes.arrayOf(PropTypes.shape({
				})),
			}),
		}),
	};

	render() {
		if(this.props.q.hide_question){
			return null;
		}
		else{
			let markElement = (<span><b>0</b>&nbsp;/&nbsp;<b>{this.props.q.max_marks}</b></span>);

			let notApplicableIcon = <Unchecked/>;

			let notApplicableElement = (notApplicableIcon);

			let answerElement;
			if(this.props.q.question_type === "PLAIN"){
				answerElement = (
					<div>
						<input className="form-control"
							value=""/>
					</div>
				);
			} else if(this.props.q.question_type === "DATE"){
				answerElement = (
					<div>
						<Datetime name="answer_text"
							value=""
							timeFormat={false}
							dateFormat="DD-MM-YYYY"
							closeOnSelect={true}/>
					</div>
				);
			} else if(this.props.q.question_type === "MUTEX") {
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							<div>
								<select className="form-control"
									value="">
									<option value=""></option>
									{this.props.q.question_data.options.map(o => <option key={o.sequence} value={o.value}>{o.value}</option>)}
								</select>
							</div>
						</div>
						<div className="col-xs-7">
							<AnswerComment question_id={this.props.q.id} editable={true} answer_comment= ""/>
						</div>
					</div>
				);
			} else if(this.props.q.question_type === "MULTISELECT") {
				let checkbox_list = [];
				for(let o of this.props.q.question_data.options){
					checkbox_list.push(<label style={{fontSize:"14px",marginBottom:"10px"}} key={o.sequence}><input type="checkbox" value={o.value} name="answer_text" style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {o.value}</span>&nbsp;</label>);
				}
				answerElement = (
					<div className="row">
						<div className="col-xs-5">
							{checkbox_list}
						</div>
						<div className="col-xs-7">
							<AnswerComment question_id={this.props.q.id} answer_comment="" editable={true}/>
						</div>
					</div>
				);
			}

			notApplicableElement = (
				<button className="btn btn-default" onClick={this.notApplicableClicked}>
					{notApplicableIcon}
				</button>
			);

			return (
				<tr>
					<td>{this.props.q.sequence}</td>
					<td>{this.props.q.question_txt}</td>
					<td>{answerElement}</td>
					<td className="text-right">{markElement}</td>
					<td className="">{notApplicableElement}</td>
				</tr>
			);
		}
	}
}

class Section extends React.Component{

	static propTypes = {
		section: sectionPropType,
	};

	constructor(props){
		super(props);
		this.state = {
			auditor_comment: "",
		};
	}


	render(){
		/* QUESTION ROWS */
		let questionRows = [];
		if( this.props.section.questions){
			for(let q of this.props.section.questions){
				questionRows.push(<QuestionRow q={q} key={q.id}/>);
			}
		}
		if(questionRows.length === 0){
			questionRows.push(<tr key="empty"><td colSpan="4" className="text-center text-muted">no questions here</td></tr>);
		}

		// let auditorCommentElement;
		let marksObtained = 0;
		let maxMarks = this.props.section.max_marks;
		let notApplicableCheckboxIcon = <Unchecked/>;
		let notApplicableElement = (<span className="">{notApplicableCheckboxIcon}</span>);
		// auditorCommentElement = (
		// 	<div>
		// 		<textarea
		// 			placeholder="enter auditor comment here"
		// 			required="true"
		// 			className="form-control"
		// 			name="auditor_comment"
		// 			value=""
		// 		/>
		// 	</div>
		// );
		var styles = {
			col1: { width: "2.5%" },
			col2: { width: "40%" },
			col3: { width: "40%" },
			col4: { width: "15%" },
			col5: { width: "2.5%" },
		};
		let panelBody;
		panelBody = ( <div>
			<table className="table table-striped">
				<thead>
					<tr>
						<th style={styles.col1}>#</th>
						<th style={styles.col2}>Question</th>
						<th style={styles.col3}>Answer</th>
						<th style={styles.col4}>Marks</th>
						<th style={styles.col5}>N/A</th>
					</tr>
				</thead>
				<tbody>
					{questionRows}
				</tbody>
			</table>
			<div className="panel-footer">
				<div>
					<b>Total Marks:</b> {marksObtained} out of {maxMarks}
				</div>
				{/* <hr/> */}
				{/* <div><b>Auditor Comment:</b> {auditorCommentElement}</div> */}
			</div>
		</div>);
		return (
			<div className="panel panel-default">
				<span className="pull-right"><b>N/A:</b> {notApplicableElement}</span>
				<div className="panel-heading">
					<h4 className="panel-title">
						{this.props.section.sequence} - {this.props.section.name}
					</h4>
				</div>
				{panelBody}
			</div>
		);
	}
}


export class QuestionnairePreview extends React.Component{
	static propTypes = {
		auditCycleId: PropTypes.string.isRequired,
		sampleQuestionnaire: PropTypes.object.isRequired,
	};
	constructor(props){
		super(props);
		this.state = {
			sections: [],
		};
	}

	componentDidMount() {
		this.setState({
			sections: this.props.sampleQuestionnaire.questionnaire_data.questionnaire
		});
	}

	componentWillReceiveProps(ownProps) {
		this.setState({
			sections: ownProps.sampleQuestionnaire.questionnaire_data.questionnaire
		});
	}

	render(){
		var orderedKeys = orderKeys(this.state.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section section={this.state.sections[sectionId]} key={sectionId} />);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="This questionnaire is empty"/>);
		}
		return (
			<div>
				<h3 className="page-header"><EyeOpen/> Preview</h3>
				{sectionRows}
			</div>
		);
	}
}


export default QuestionnairePreview;
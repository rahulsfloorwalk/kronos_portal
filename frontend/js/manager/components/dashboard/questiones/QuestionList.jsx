import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Cross, Pencil } from "../../../../components/Icons.jsx";
import { deleteQuestion, findQuestions, findSolutionById } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class DashQuestionRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		question: PropTypes.shape({
			id: PropTypes.number,
			question_txt: PropTypes.string,
			sequence : PropTypes.number,
			max_marks: PropTypes.number,
			question_type : PropTypes.string,
		}),
		onDelete: PropTypes.func,
		solutionId: PropTypes.string.isRequired,
	};
	render() {
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.question.question_txt}</td>
				<td>{this.props.question.max_marks}</td>
				<td>{this.props.question.question_type}</td>
				<td>
					<span style={{marginRight:"2rem"}}>
						<Link
							to={`/admindashboard/solution/${this.props.solutionId}/question/${this.props.question.id}/edit`}
							className="btn btn-default"><Pencil /></Link>
					</span>
					<button type="button"
						onClick={() => this.props.onDelete(this.props.question)}
						className="btn btn-default"><Cross /></button>
				</td>
			</tr>
		);
	}
}
export default class QuestionList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
		onChange: PropTypes.func,
		onDelete: PropTypes.func,
	};
	state = {
		loading: false,
		solution:{},
		questions: [],
		errors: {
		}
	};
	setLoading = (loadingState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	};
	componentDidMount() {
		if (this.props.params.solutionId) {
			this.setLoading(true);
			findSolutionById(this.props.params.solutionId).then((solution) => {
				this.setState({
					solution: Object.assign({}, solution)
				});
			}).always(() => this.setLoading(false));
		}
		findQuestions(this.props.params.solutionId).then((questions) => {
			this.setState({
				questions
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	onDelete = (question) => {
		const updatedquestions = this.state.questions.filter(
			(c) => c.id !== question.id
		);
		this.setState({
			questions: updatedquestions
		});
		deleteQuestion(question.id).then(() => {
			this.props.onChange && this.props.onChange();
			Alert.success("Question DELETED");
		}, () => {
			Alert.warning("Question CANNOT BE DELETED");
		});
	};

	render() {
		const rows = this.state.questions.map((c, i) => <DashQuestionRow seq={i + 1} question={c} key={c.id}
			onDelete={this.onDelete}
			solutionId={this.props.params.solutionId}
		/>);
		return (
			<div className="panel panel-default table-responsive">
				<div style={{display:"flex",justifyContent:"flex-end",padding:"1rem 1rem 0rem 0rem"}}>
					<Link to="/admindashboard/solution">   <Cross/></Link>
				</div>
				<h3 style={{ padding: "2rem",paddingTop:"1rem", borderBottom: "1px solid #eee" }}>
Question Table for <b>{this.state.solution.name}</b>
					<Link to={`/admindashboard/solution/${this.props.params.solutionId}/question/add`} className="btn btn-default pull-right"><Plus /> Add Question</Link>
				</h3>
				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Question</th>
								<th>Max. Marks</th>
								<th>Question Type</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}

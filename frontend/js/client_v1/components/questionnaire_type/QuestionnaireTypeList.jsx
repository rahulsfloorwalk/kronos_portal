import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import Alert from "react-s-alert";

import Loading from "../../../components/Loading.jsx";
import { Cross, Check, Plus, Pencil } from "../../../components/Icons.jsx";
import { fetchQuestionnaireTypes, deleteQuestionnaireType } from "../../service/questionnaire_type.js";

export class __QuestionnaireTypeList extends Component{
	static propTypes = {
		questionnaireTypes: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
		})),
		clientId: PropTypes.number.isRequired,
		loading: PropTypes.bool,

		onDelete: PropTypes.func.isRequired,

		children: PropTypes.node,
	};

	static defaultProps = {
		loading: false,
	};

	render(){
		if(this.props.loading){
			return <Loading/>;
		}

		const rows = [];
		for(const qt of this.props.questionnaireTypes) {
			rows.push(<tr key={qt.id}>
				<td>{qt.name}</td>
				<td>{qt.is_default ? <Check/> : null}</td>
				<td className="text-right">
					<Link className="btn btn-default" to={`/projects/${this.props.clientId}/questionnaire_type/${qt.id}/edit`}><Pencil/> Edit</Link>
					&nbsp;
					<button onClick={()=>this.props.onDelete(qt)} className="btn btn-default"><Cross/> Delete</button>
				</td>
			</tr>);
		}
		return (
			<div>
				<h3 className="page-header">
					<Link to={`/projects/${this.props.clientId}/questionnaire_type/add`} className="btn btn-default pull-right">
						<Plus/> New
					</Link>
					Questionnaire Types
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Questionnaire Type</th>
							<th>Default</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{this.props.children}
			</div>
		);
	}
}

export default class QuestionnaireTypeList extends Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}),
		children: PropTypes.node,
	};
	state = {
		loading: true,
		questionnaireTypes: [],
	};

	setLoading = loading => this.setState(prevState => Object.assign({}, prevState, { loading }));

	reload = clientId => {
		this.setLoading(true);
		fetchQuestionnaireTypes(clientId).then(questionnaireTypes => {
			this.setState({ questionnaireTypes });
		}).always(() => this.setLoading(false));
	};

	onDelete = (questionnaireType) => {
		deleteQuestionnaireType(questionnaireType.id).then(() => {
			this.reload(this.props.params.clientId);
			Alert.success("QUESTIONNAIRE TYPE DELETED");
		}, () => {
			Alert.warning("QUESTIONNAIRE TYPE COULD NOT BE DELETED");
		});
	};

	componentDidMount(){
		this.reload(this.props.params.clientId);
	}

	componentWillReceiveProps(ownProps){
		this.reload(ownProps.params.clientId);
	}

	render(){
		return <__QuestionnaireTypeList
			clientId={parseInt(this.props.params.clientId)}
			loading={this.state.loading}
			questionnaireTypes={this.state.questionnaireTypes}
			onDelete={this.onDelete}>
			{this.props.children}
		</__QuestionnaireTypeList>;
	}
}

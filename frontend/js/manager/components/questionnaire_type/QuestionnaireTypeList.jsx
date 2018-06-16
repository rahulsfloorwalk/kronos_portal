import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check, Plus } from "../../../components/Icons.jsx";
import { fetchQuestionnaireTypes } from "../../service/questionnaire_type.js";

export class __QuestionnaireTypeList extends Component{
	static propTypes = {
		questionnaireTypes: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
		})),
		clientId: PropTypes.number.isRequired,
		loading: PropTypes.bool,

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
			</tr>);
		}
		return (
			<div>
				<h3 className="page-header">
					<Link to={`/client/${this.props.clientId}/questionnaire_type/add`} className="btn btn-default pull-right">
						<Plus/> New
					</Link>
					Questionnaire Types
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Questionnaire Type</th>
							<th>Default</th>
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

	componentDidMount(){
		this.setLoading(true);
		fetchQuestionnaireTypes(this.props.params.clientId).then(questionnaireTypes => {
			this.setState({ questionnaireTypes });
		}).always(() => this.setLoading(false));
	}
	render(){
		return <__QuestionnaireTypeList
			clientId={parseInt(this.props.params.clientId)}
			loading={this.state.loading}
			questionnaireTypes={this.state.questionnaireTypes}
			children={this.props.children}/>
	}
}

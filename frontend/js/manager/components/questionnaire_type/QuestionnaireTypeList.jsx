import React, { Component } from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import Loading from "../../../components/Loading.jsx";
import { Check } from "../../../components/Icons.jsx";

import { fetchQuestionnaireTypes } from "../../service/questionnaire_type.js";

export class __QuestionnaireTypeList extends Component{
	static propTypes = {
		questionnaireTypes: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
		})),
		loading: PropTypes.bool,
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
			</div>
		);
	}
}


export default class QuestionnaireTypeList extends Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}),
	};
	state = {
		loading: false,
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
		return <__QuestionnaireTypeList loading={this.state.loading} questionnaireTypes={this.state.questionnaireTypes}/>;
	}
}

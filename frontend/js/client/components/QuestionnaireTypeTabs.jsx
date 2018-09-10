import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { pointerStyle } from "../../styles.js";

import Loading from "../../components/Loading.jsx";
import { findQuestionnaireTypes, findSelectedQuestionnaireType, findDefaultQuestionnaireType } from "../reducers/questionnaire_type";
import { fetchQuestionnaireTypes, selectQuestionnaireType } from "../actions/questionnaire_type";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	is_default: PropTypes.bool.isRequired,
});

export class QuestionnaireTypeTabs extends React.Component{
	static propTypes =  {
		questionnaireTypes: PropTypes.arrayOf(questionnaireTypePropType),
		selectedQuestionnaireType: questionnaireTypePropType,
		defaultQuestionnaireType: questionnaireTypePropType,

		onMount: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
	};
	componentDidMount() {
		this.props.onMount();
	}

	getFirstQuestionnaireType = () => {
		return this.props.questionnaireTypes[0];
	};

	render(){
		if(this.props.questionnaireTypes.length === 0){
			return <Loading/>;
		}

		const selectedQuestionnaireType = this.props.selectedQuestionnaireType || this.props.defaultQuestionnaireType || this.getFirstQuestionnaireType();


		if(this.props.questionnaireTypes.length > 1) {
			return (<ul className="nav nav-tabs nav-justified">
				{this.props.questionnaireTypes.map( qt => {
					const activeClass = selectedQuestionnaireType.id === qt.id ? "active" : "";
					return <li className={activeClass} key={qt.id} style={pointerStyle}>
						<a onClick={() => this.props.onSelect(qt.id)}>
							<b>{qt.name}</b>
						</a>
					</li>;
				})}
			</ul>);
		}
		return null;
	}
}

const mapStateToProps = (state) => {
	return {
		questionnaireTypes: findQuestionnaireTypes(state),
		selectedQuestionnaireType: findSelectedQuestionnaireType(state),
		defaultQuestionnaireType: findDefaultQuestionnaireType(state),
	};
};

export default connect(mapStateToProps, {
	onMount: fetchQuestionnaireTypes,
	onSelect: selectQuestionnaireType,
})(QuestionnaireTypeTabs);

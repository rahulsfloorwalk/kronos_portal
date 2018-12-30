import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { pointerStyle } from "../../styles.js";

import Loading from "../../components/Loading.jsx";
// import { findQuestionnaireTypes, findSelectedQuestionnaireType, findDefaultQuestionnaireType } from "../reducers/questionnaire_type";
import { fetchQuestionnaireTypes, selectQuestionnaireType } from "../actions/questionnaire_type";
import { questionnaireTypeSelectors } from "../selectors";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	is_default: PropTypes.bool.isRequired,
});

export class QuestionnaireTypeTabs extends React.Component{
	static propTypes =  {
		questionnaireTypes: PropTypes.arrayOf(questionnaireTypePropType),
		selectedQuestionnaireType: questionnaireTypePropType,

		onMount: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
	};
	componentDidMount() {
		this.props.onMount();
	}

	render(){
		if(this.props.questionnaireTypes.length === 0){
			return <Loading/>;
		}


		if(this.props.questionnaireTypes.length > 1) {
			return (<ul className="nav nav-tabs nav-justified hidden-print">
				{this.props.questionnaireTypes.map( qt => {
					const activeClass = this.props.selectedQuestionnaireType.id === qt.id ? "active" : "";
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
		questionnaireTypes: questionnaireTypeSelectors.findQuestionnaireTypes(state),
		selectedQuestionnaireType: questionnaireTypeSelectors.findSelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps, {
	onMount: fetchQuestionnaireTypes,
	onSelect: selectQuestionnaireType,
})(QuestionnaireTypeTabs);

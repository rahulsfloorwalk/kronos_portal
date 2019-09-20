import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { } from "../../../styles.js";

import Section from "./Section.jsx";

import Loading from "../../../components/Loading.jsx";
import Jumbotron from "../../../components/Jumbotron.jsx";
import { Tasks } from "../../../components/Icons.jsx";

import { orderKeys } from "../../../react_utils.js";

import { fetchSections } from "../../actions/section.js";
import { fetchAnswers } from "../../actions/answer.js";
import { fetchReportSections } from "../../actions/report_section.js";

class SectionList extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		sections: PropTypes.object.isRequired,
		showErrors: PropTypes.bool.isRequired,
		auditStoreId: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.string,
		]).isRequired,
	};

	constructor(props){
		super(props);
		this.state = {
			loading: true,
		};
	}

	setLoading = (loading) => {
		this.setState((prevState) => Object.assign({}, prevState, { loading }));
	};

	componentDidMount() {
		//console.log("SectionList#componentDidMount");
		this.setLoading(true);
		Promise.all([
			this.props.dispatch(fetchSections(this.props.auditStoreId)),
			this.props.dispatch(fetchAnswers(this.props.auditStoreId)),
			this.props.dispatch(fetchReportSections(this.props.auditStoreId)),
		]).then(() => {
			this.setLoading(false);
		});
	}
	/*componentWillReceiveProps: function(nextProps){
		console.log("SectionList#componentWillReceiveProps");
		if( ! this.state.loading){
			console.log("hello world", nextProps);
			this.setState({
				loading:true
			});
			this.props.dispatch(fetchSections(this.props.params.auditCycleId)).always(() => {
				console.log("bye world", nextProps);
				this.setState({
					loading:false
				});
			});
		}
		console.log("SectionList#this.props.children",nextProps.children);
	},*/
	render(){
		if(this.state.loading){
			return <Loading/>;
		}

		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditStoreId={this.props.auditStoreId} section={this.props.sections[sectionId]} key={sectionId} showErrors={this.props.showErrors} sections={this.props.sections} editable={this.props.editable}/>);
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="please contact support"/>);
		}
		return (
			<div>
				<h3 className="page-header"><Tasks/> Questionnaire</h3>
				{sectionRows}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		sections: store.sections
	};
};

export default connect(mapStoreToProps)(SectionList);

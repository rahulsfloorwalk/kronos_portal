import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import Alert from "react-s-alert";

import {url}  from "../../../../config.js";

import Jumbotron from "../../../components/Jumbotron.jsx";
import { Duplicate, Tasks, Plus, Download,DownloadAlt } from "../../../components/Icons.jsx";

import { orderKeys } from "../../../react_utils.js";
import { fetchSections, deleteSection } from "../../actions/section.js";
import Section from "./Section.jsx";

class SectionList extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,

		sections: PropTypes.object,
		children: PropTypes.node,
	};

	state = {
		loading: false
	};

	reloadData = (auditCycleId) => {
		this.setState({
			loading:true
		});
		this.props.dispatch(fetchSections(auditCycleId)).always(() => {
			this.setState({
				loading:false
			});
		});
	};

	componentDidMount() {
		this.reloadData(this.props.params.auditCycleId);
	}

	componentWillReceiveProps(nextProps) {
		if( ! this.state.loading){
			this.reloadData(nextProps.params.auditCycleId);
		}
	}

	onSectionDelete = (section) => {
		this.props.dispatch(deleteSection(section.id)).then(() => {
			Alert.success("Section deleted");
		}, () => {
			Alert.warning("SECTION CANNOT BE DELETED");
		});
	};

	render() {
		var orderedKeys = orderKeys(this.props.sections, function(s1,s2){
			return s1.sequence - s2.sequence;
		});
		var sectionRows = [];
		let questionnaireTotal = 0;
		for(var sectionId of orderedKeys) {
			sectionRows.push(<Section auditCycleId={this.props.params.auditCycleId} section={this.props.sections[sectionId]} key={sectionId} onChange={() => this.reloadData(this.props.params.auditCycleId)} onDelete={this.onSectionDelete}/>);

			//add up into the total
			questionnaireTotal += this.props.sections[sectionId].max_marks;
		}
		if( sectionRows.length === 0){
			sectionRows.push(<Jumbotron key="empty" heading="this questionnaire is empty" para="start by adding a section"/>);
		}
		return (
			<div>
				<h3 className="page-header">
					<span className="pull-right">
						<Link to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire/section/import`} className="btn btn-default pull-left" style={{marginRight:"10px"}}><DownloadAlt/> Import Questionnaire</Link>
						<Link to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire/section/add`} className="btn btn-default">
							<Plus/> Add Section
						</Link>&nbsp;
						<Link to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire/section/copy`} className="btn btn-default" title="Copy Sections">
							<Duplicate/> Copy Sections
						</Link>&nbsp;
						<a className="btn btn-default pull-right" href={url.api_base_path + "manager/audit_cycle/" + this.props.params.auditCycleId + "/export_questionnaire"}>
							<Download/> Export
						</a>
					</span>
					<Tasks/> Questionnaire ( {questionnaireTotal} Marks)
				</h3>
				{sectionRows}
				{this.props.children}
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		sections: store.sections
	};
};

export default ReactRedux.connect(mapStoreToProps)(SectionList);

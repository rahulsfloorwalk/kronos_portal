import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import Loading from "../../../components/Loading.jsx";

import { fetchAuditStore } from "../../actions/audit_store.js";
import { fetchSections } from "../../actions/section.js";
import { fetchReportSections } from "../../actions/report_section.js";
import { fetchAnswers } from "../../actions/answer.js";

import { auditStorePropType } from "../../prop_types.js";

import AuditStoreDetails from "./AuditStoreDetails.jsx";
import AuditStoreButtonPanel from "./AuditStoreButtonPanel.jsx";
import AttachmentUploadBox from "./AttachmentUploadBox.jsx";
import SectionList from "./SectionList.jsx";

import { findAuditStore } from "../../reducers/audit_store.js";

export class __AuditStoreReport extends React.Component {
	static propTypes = {
		fetchAuditStore: PropTypes.func.isRequired,
		fetchSections: PropTypes.func.isRequired,
		fetchAnswers: PropTypes.func.isRequired,
		fetchReportSections: PropTypes.func.isRequired,

		auditStore: auditStorePropType,
	};

	state = {
		showErrors: false,
	};

	setShowErrors = () => this.setState((prevState) => Object.assign({}, prevState, { showErrors: true }));

	componentDidMount() {
		this.props.fetchAuditStore();
		this.props.fetchSections();
		this.props.fetchReportSections();
		this.props.fetchAnswers();
	}

	render(){
		if(this.props.auditStore) {
			const buttonPanel = <AuditStoreButtonPanel auditStoreId={this.props.auditStore.id} onSubmit={this.setShowErrors}/>;
			return (<div>
				<AuditStoreDetails auditStore={this.props.auditStore}/>
				{buttonPanel}
				<AttachmentUploadBox auditStoreId={this.props.auditStore.id}/>
				<SectionList auditStoreId={this.props.auditStore.id} showErrors={this.state.showErrors}/>
				{buttonPanel}
			</div>);
		} else {
			return <Loading/>;
		}
	}
}

const mapStoreToProps = (store, ownProps) => {
	return {
		auditStore: findAuditStore( store, parseInt(ownProps.params.auditStoreId)),
	};
};

const mapDispatchToProps = (dispatch, { params }) => {
	return {
		fetchAuditStore: () => dispatch(fetchAuditStore(params.auditStoreId)),
		fetchReportSections: () => dispatch(fetchReportSections(params.auditStoreId)),
		fetchAnswers: () => dispatch(fetchAnswers(params.auditStoreId)),
		fetchSections: () => dispatch(fetchSections(params.auditStoreId)),
	};
};

const AuditStoreReport = connect(mapStoreToProps, mapDispatchToProps)(__AuditStoreReport);

AuditStoreReport.propTypes = {
	params: PropTypes.shape({
		auditStoreId: PropTypes.string.isRequired,
	}).isRequired,
};

export default AuditStoreReport;

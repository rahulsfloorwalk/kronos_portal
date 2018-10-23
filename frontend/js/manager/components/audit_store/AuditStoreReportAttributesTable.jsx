import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import AuditStoreReportAttributeRow from "./AuditStoreReportAttributeRow.jsx";

import {auditStorePropType, reportAttributePropType} from "../../prop_types";

import { findAuditStoreById } from "../../selectors/audit_store";
import { findReportAttributesByAuditStoreId } from "../../selectors/report_attribute";
import { fetchReportAttributes } from "../../actions/report_attribute";


export class AuditStoreReportAttributesTable extends React.Component {
	static propTypes = {
		auditStoreId: PropTypes.number.isRequired,
		auditStore: auditStorePropType,
		reportAttributes: PropTypes.arrayOf(reportAttributePropType),

		fetchReportAttributesByAuditCycleId: PropTypes.func.isRequired,
	};

	componentDidMount() {
		if(this.props.auditStore){
			this.props.fetchReportAttributesByAuditCycleId(this.props.auditStore.audit.audit_cycle.id);
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.auditStore !== this.props.auditStore){
			nextProps.fetchReportAttributesByAuditCycleId(nextProps.auditStore.audit.audit_cycle.id);
		}
	}

	render(){
		const reportAttributeRows = this.props.reportAttributes.map(ra => <AuditStoreReportAttributeRow
			key={ra.id} reportAttribute={ra} selectedOptionId={this.props.auditStore.attribute_data[ra.json_id]}
		/>);
		return(
			<tbody>
				{reportAttributeRows}
			</tbody>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auditStore: findAuditStoreById(state, ownProps.auditStoreId),
		reportAttributes: findReportAttributesByAuditStoreId(state, ownProps.auditStoreId),
	};
};

export default connect(mapStateToProps, {
	fetchReportAttributesByAuditCycleId: fetchReportAttributes,
})(AuditStoreReportAttributesTable);

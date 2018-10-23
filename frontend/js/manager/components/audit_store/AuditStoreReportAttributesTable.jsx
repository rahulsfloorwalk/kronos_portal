import React from "react";
import PropTypes from "prop-types";

import AuditStoreReportAttributeRow from "./AuditStoreReportAttributeRow.jsx";

import {auditStorePropType, reportAttributePropType} from "../../prop_types";


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

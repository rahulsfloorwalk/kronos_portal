import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { fetchAuditCycles, selectAuditCycle } from "../actions/audit_cycle";
import { auditCycleSelectors } from "../selectors";

const auditCyclePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	start_date: PropTypes.string.isRequired,
	end_date: PropTypes.string.isRequired,
});

export class AuditCycleSelector extends React.Component {
	static propTypes = {
		auditCycles: PropTypes.arrayOf(auditCyclePropType),
		selectedAuditCycle: auditCyclePropType,

		onMount: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.onMount();
	}

	render(){
		if(this.props.selectedAuditCycle) {
			const auditCycleRows = this.props.auditCycles.map((ac) => <option value={ac.id} key={ac.id}>{ac.name}</option>);
			return (<div style={{width: "200px", display: "inline-block"}}>
				<label className="control-label">&nbsp;Audit Cycle:</label>
				<select className="form-control" value={this.props.selectedAuditCycle.id} onChange={(e) => this.props.onSelect(parseInt(e.target.value))}>
					{auditCycleRows}
				</select>
			</div>);
		} else {
			return null;
		}
	}
}

const mapStateToProps = (state) => {
	return {
		auditCycles: auditCycleSelectors.findAuditCyclesBySelectedQuestionnaireType(state),
		selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycleBySelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps, {
	onMount: fetchAuditCycles,
	onSelect: selectAuditCycle,
})(AuditCycleSelector);

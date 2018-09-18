import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import moment from "moment";

import { fetchAuditCycles, selectAuditCycle } from "../actions/audit_cycle";
import { auditCycleSelectors, questionnaireTypeSelectors } from "../selectors";

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
			return (<div>
				<select className="form-control input-lg" style={{width:"400px", display:"inline-block"}} value={this.props.selectedAuditCycle.id} onChange={(e) => this.props.onSelect(parseInt(e.target.value))}>
					{auditCycleRows}
				</select>
				<small> {moment(this.props.selectedAuditCycle.start_date).format("Do MMM")} to {moment(this.props.selectedAuditCycle.end_date).format("Do MMM")}</small>
			</div>);
		} else {
			return null;
		}
	}
}

const mapStateToProps = (state) => {
	const selectedQuestionnaireType = questionnaireTypeSelectors.findSelectedQuestionnaireType(state);
	if(selectedQuestionnaireType) {
		return {
			auditCycles: auditCycleSelectors.findAuditCyclesByQuestionnaireType(state, selectedQuestionnaireType.id),
			selectedAuditCycle: auditCycleSelectors.findSelectedAuditCycle(state, selectedQuestionnaireType.id),
		};
	} else {
		return {
			auditCycles: [],
		};
	}
};

export default connect(mapStateToProps, {
	onMount: fetchAuditCycles,
	onSelect: selectAuditCycle,
})(AuditCycleSelector);

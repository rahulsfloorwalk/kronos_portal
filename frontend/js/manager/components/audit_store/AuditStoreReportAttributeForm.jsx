import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import Modal from "../../../components/Modal.jsx";

import {auditStorePropType, reportAttributePropType} from "../../prop_types";

import { setReportAttributeValue } from "../../actions/audit_store";
import { findAuditStoreById } from "../../selectors/audit_store";
import { findReportAttributeByAuditStoreIdAndJsonId } from "../../selectors/report_attribute";

export class AuditStoreReportAttributeForm extends React.Component {
	static propTypes = {
		auditStore: auditStorePropType,
		reportAttribute: reportAttributePropType,

		onSubmit: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	};

	state = {
		optionId: "",
	};

	componentDidMount(){
		if(this.props.auditStore && this.props.reportAttribute){
			this.setState({
				optionId: this.props.auditStore.attribute_data[this.props.reportAttribute.json_id] || "",
			});
		}
	}

	onOptionChange = (e) => {
		this.setState({
			optionId: e.target.value,
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit(this.props.auditStore.id, this.props.reportAttribute.json_id, this.state.optionId).then(this.props.onClose);
	};

	render(){
		const modalTitle = `Set ${this.props.reportAttribute.label}`;
		const options = this.props.reportAttribute.attribute_data.options.map(o => <option key={o.option_id} value={o.option_id}>{o.option_label}</option>);
		return (<Modal modalTitle={modalTitle} onClose={this.props.onClose}>
			<form onSubmit={this.onSubmit}>
				<div className="form-group">
					<label>{this.props.reportAttribute.label}</label>
					<select className="form-control" value={this.state.optionId} onChange={this.onOptionChange}>
						<option value="">Select Value</option>
						{options}
					</select>
				</div>
				<div className="form-group">
					<button className="btn btn-lg btn-primary">
						Save
					</button>
				</div>
			</form>
		</Modal>);
	}
}

const mapStateToProps = (state, ownProps) => {
	const auditStoreId = parseInt(ownProps.params.auditStoreId);
	const reportAttributeJsonId = ownProps.params.reportAttributeJsonId;
	return {
		auditStore: findAuditStoreById(state, auditStoreId),
		reportAttribute: findReportAttributeByAuditStoreIdAndJsonId(state, auditStoreId, reportAttributeJsonId),
		onClose: ownProps.router.goBack,
	};
};

export default connect(mapStateToProps, {
	onSubmit: setReportAttributeValue,
})(AuditStoreReportAttributeForm);

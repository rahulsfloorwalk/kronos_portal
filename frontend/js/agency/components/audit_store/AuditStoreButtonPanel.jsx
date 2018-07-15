import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { submitAuditStore, acknowledgeAuditStore } from "../../actions/audit_store.js";
import { AuditStoreStatus } from "../../../constants.js";

class __AuditStoreButtonPanel extends React.Component {
	static propTypes = {
		submitAuditStore: PropTypes.func.isRequired,
		acknowledgeAuditStore: PropTypes.func.isRequired,

		status: PropTypes.oneOf(AuditStoreStatus).isRequired,
	};

	state = {
		submitMessage : "",
		submitStatus: "",
	};

	resetState = () => this.setState((prevState) => Object.assign({}, prevState, { submitMessage: "", submitStatus: "", }));

	submitAuditStore = () => {
		this.resetState();
		this.props.submitAuditStore().catch((err) => {
			if(err.response){
				this.setState({
					submitMessage: err.response.data["non_field_errors"][0],
					submitStatus: "danger",
				});
			}
		});
	};

	render(){
		if(this.props.status === "ASSIGNED"){
			return <div className="form-group">
				<button onClick={this.props.acknowledgeAuditStore} type="button" className="btn btn-primary btn-lg">
					Agree
				</button>
				&nbsp;
				&nbsp;
				<big>I have read the <b>instructions</b>, <b>questionnaire</b> and agree to conduct the audit.</big>
			</div>;
		} else if(this.props.status === "ACKNOWLEDGED"){
			return <div className="form-group">
				<button onClick={this.submitAuditStore} type="button" className="btn btn-primary btn-lg">
					Submit Report
				</button>
				&nbsp;
				&nbsp;
				<big><b className={this.state.submitStatus ? "text-" + this.state.submitStatus : ""}>{this.state.submitMessage}</b></big>
			</div>;
		} else {
			return null;
		}
	}
}

const findAuditStore = (store, auditStoreId) => {
	return store.auditStores.find((as) => as.id === auditStoreId);
};

const mapStoreToProps = (store, ownProps) => {
	const auditStore = findAuditStore( store, parseInt(ownProps.auditStoreId));
	return {
		status: auditStore && auditStore.status,
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		submitAuditStore : () => {
			ownProps.onSubmit();
			return dispatch(submitAuditStore(ownProps.auditStoreId));
		},
		acknowledgeAuditStore: () => dispatch(acknowledgeAuditStore(ownProps.auditStoreId)),
	};
};

const AuditStoreButtonPanel = connect(mapStoreToProps, mapDispatchToProps)(__AuditStoreButtonPanel);

AuditStoreButtonPanel.propTypes = {
	auditStoreId: PropTypes.number.isRequired,
	onSubmit: PropTypes.func.isRequired,
};

export default AuditStoreButtonPanel;

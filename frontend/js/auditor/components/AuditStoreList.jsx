import React from "react";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStores } from "../actions/audit_store.js";
import { fetchProfileInfo } from "../actions/profile_info.js";

import ExpandableDetails from "../../components/ExpandableDetails.jsx";
import { Cross, ShareAlt } from "../../components/Icons.jsx";
import { getAuditType, getAuditStatus } from "../../utils.js";
import { LabelValue_2_10 } from "../../components/LabelValue.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";

class AuditStoreRow extends React.Component {
	render() {
		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		const fees = earnings_per_audit ? <b>Fees: ₹ {earnings_per_audit}, </b> : "";
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		const reimb = reimbursement ? <span>Reimbursement upto: <b>₹ {reimbursement}</b></span> : "";

		let inlineBlockStyle = {
			display: "inline-block",
			marginBottom: "10px",
		};

		return (
			<div className="panel panel-default">
				<div className="panel-body">
					<h3 className="">
						<b>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> - {this.props.auditStore.audit.store.name}
					</h3>
					<div>
						<AuditStoreStatusLabel status={this.props.auditStore.status}/>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						<div style={inlineBlockStyle}>
							<b>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</b>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							{<span>{fees}{reimb}</span>}
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							<AuditTypeLabel auditType={this.props.auditStore.audit.audit_cycle.type}/>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							<ExpandableDetails details={<div>
								<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
								<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
							</div>}/>
						</div>
					</div>
					<p><b>Address:</b> {this.props.auditStore.audit.store.address}</p>
					<Link to={`/audit_store/${this.props.auditStore.id}/section`} className="btn btn-default">View</Link>
				</div>
			</div>
		);
	}
}

class AuditStoreList extends React.Component {
    state = {
    	auditStores: [],
    };

    componentDidMount() {
    	//FIXME we're using BOTH internal component state and the redux store to contain the list of audit stores.
    	//ideally only one should exist.
    	this.props.dispatch(fetchAuditStores()).then( auditStores => this.setState({auditStores}));
    	this.props.dispatch(fetchProfileInfo());
    }

    render() {
    	let rows = this.state.auditStores.map(as => <AuditStoreRow auditStore={as} key={as.id}/>);
    	if(rows.length > 0){
    		return (
    			<div>
    				<h2 className="page-header">
						Your Audits
    				</h2>
    				{rows}
    				{this.props.children}
    			</div>
    		);
    	} else {
    		return (
    			<div className="jumbotron text-center">
    				<h2>There are no audits approved for you.</h2>
    				<h3>Apply for some audits from the audits section!</h3>
    				<p>We will keep you informed when audits are approved for you</p>
    			</div>
    		);
    	}
    }
}

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		auditStores: store.auditStores,
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);

import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchAuditStores } from "../actions/audit_store.js";
import { fetchProfileInfo } from "../actions/profile_info.js";

// import ExpandableDetails from "../../components/ExpandableDetails.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import AuditTypeLabel from "../../components/AuditTypeLabel.jsx";
import MarkdownViewer from "../../components/MarkdownViewer.jsx";
import Loading from "../../components/Loading.jsx";

import { auditStorePropType } from "../prop_types";
import ExpandableDetailsReport from "./ExpandableDetailsReport.jsx";

class AuditStoreRow extends React.Component {
	static propTypes = {
		auditStore: auditStorePropType,
	};
	render() {
		let revertMessage = null;
		if (this.props.auditStore.report_revert_count > 0) {
			revertMessage = <h4 style={{marginLeft: "10px"}}><b>(Reverted)</b></h4>;
		}

		let withdrawButton , auditStoreStatusLabel, withdrawMessage, viewButton, concernButton;
		const earnings_per_audit = this.props.auditStore.earnings_per_audit || this.props.auditStore.audit.earnings_per_audit;
		// const fees = earnings_per_audit ? <b>Fees: ₹ {earnings_per_audit}, </b> : "";
		// const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		// const reimb = reimbursement ? <span><b>Reimbursement upto: ₹ {reimbursement}</b></span> : "";

		const fees = (earnings_per_audit || earnings_per_audit === 0) ? <span><b>Fees:</b> ₹ {earnings_per_audit} </span> : <span><b>Fees:</b> ₹ 0 </span>;
		const reimbursement = this.props.auditStore.reimbursement || this.props.auditStore.audit.reimbursement;
		// const reimb = reimbursement ? <span><b>, Reimbursement upto:</b> ₹ {reimbursement}</span> : "";
		const reimb = (reimbursement || reimbursement === 0) ? <span><b>, Reimbursement upto:</b> ₹ {reimbursement}</span> : <span><b>, Reimbursement upto:</b> ₹ 0</span>;



		let inlineBlockStyle = {
			display: "inline-block",
			marginBottom: "10px",
		};

		if((this.props.auditStore.status === "ASSIGNED" || this.props.auditStore.status === "ACKNOWLEDGED") && this.props.auditStore.get_date_diff <= -1){
			withdrawButton = (<Link to={`audit_store/${this.props.auditStore.id}/withdraw`} className="btn btn-default">Withdraw</Link>);
		}
		if(this.props.auditStore.status === "ASSIGNED" || this.props.auditStore.status === "ACKNOWLEDGED"){
			concernButton = (<Link to={`audit_store/${this.props.auditStore.id}/report_concern`} className="btn btn-danger">Having Trouble?</Link>);
		}

		if (this.props.auditStore.status === "AUDITOR_WITHDRAWN" ){
			auditStoreStatusLabel = (<AuditStoreStatusLabel status="WITHDRAWN"/>);
			withdrawMessage = (<span><b>Your Audit has been Withdrawn.</b></span>);
			viewButton = (<Link className="btn btn-default" style={{ pointerEvents: "none" }} disabled>View Report</Link>);
		}
		else{
			auditStoreStatusLabel = (<AuditStoreStatusLabel status={this.props.auditStore.status}/>);
			if (this.props.auditStore.status === "ASSIGNED" || this.props.auditStore.status === "ACKNOWLEDGED" ){
				viewButton = (<Link to={`/audit_store/${this.props.auditStore.id}/section`} className="btn btn-success">View Report</Link>);
			}
		}
		// let completionPercentage;
		// if (this.props.auditStore.completion_percentage !== undefined) {
		// 	completionPercentage = (
		// 		<div>
		// 			{this.props.auditStore.completion_percentage} / 100     {/*uncomment when not use percentage bar*/}
		// 		</div>
		// 	);
		// }
		return (
			<div className="panel panel-default">
				<div className="panel-body" style={{ marginTop:"-25px"}}>
					<h3 className="d-flex align-items-center" style={{ display: "flex", alignItems: "center" }}>
						<b style={{ marginRight: "10px" }}>{this.props.auditStore.audit.audit_cycle.client.auditor_display_name}</b> - {this.props.auditStore.audit.store.name}
						&nbsp;
						{this.props.auditStore.status === "SUBMITTED" ? (
							<span className="btn btn-success">
								Submited
							</span>
						) :  this.props.auditStore.status !== "AUDITOR_WITHDRAWN" && (
							<div className="d-flex align-items-center mt-3 ">
								<Link to={`/audit_store/${this.props.auditStore.id}/section`} style={{ display: "flex", alignItems: "center", marginTop: "18px", textDecoration: "none" }}>
									{/* <div className="" style={{ marginLeft: "10px",marginBottom: "22px" }}> */}
									<span style={{ color: "black", fontSize: "15px",marginBottom: "15px",marginLeft: "15px" }}>Report Completion %:-</span>
									{/* </div> */}
									<div className="progress" style={{ width: "80px", marginLeft: "10px" }}>
										<div className="progress-bar bg-primary" role="progressbar" style={{ width: `${this.props.auditStore.completion_percentage}%`, backgroundColor: this.props.auditStore.completion_percentage === 100 ? "#28a745" : " " }} aria-valuenow={this.props.auditStore.completion_percentage} aria-valuemin="0" aria-valuemax="100">
											{this.props.auditStore.completion_percentage}%
										</div>
									</div>
								</Link>
							</div>

						)}
						{revertMessage}
					</h3>
					<div>
						<b> Audit Status : </b> {auditStoreStatusLabel}
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						<div style={inlineBlockStyle}>
							<b>Audit Date : {moment(this.props.auditStore.audit_date).format(momentDateFormat)}</b>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div>
							{<span>{fees}{reimb}</span>}
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							<AuditTypeLabel auditType={this.props.auditStore.audit.audit_cycle.type}/>
						&nbsp;&nbsp;&bull;&nbsp;&nbsp;
						</div>
						<div style={inlineBlockStyle}>
							<ExpandableDetailsReport details={<div>
								<MarkdownViewer markdown={this.props.auditStore.audit.post_approval_description || ""}/>
								<MarkdownViewer markdown={this.props.auditStore.audit.audit_cycle.post_approval_description || ""}/>
							</div>}
							auditStoreId={this.props.auditStore.id}/>
						</div>
					</div>
					<p><b>Address:</b> {this.props.auditStore.audit.store.address}</p>
					{viewButton}
					&nbsp;&nbsp;
					{withdrawButton}
					{withdrawMessage}
					&nbsp;&nbsp;
					{concernButton}
					{/* <div style={{ display: "inline-block", verticalAlign: "bottom"}}>{completionPercentage} <b>Completion Percentage</b></div>  percentage bar */}
				</div>
			</div>
		);
	}
}

class AuditStoreList extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		children: PropTypes.node,
	};

	state = {
		auditStores: [],
		loading: false
	};

	setLoading = (loading) => {
		this.setState(oldState => Object.assign({}, oldState, { loading }));
	};

	componentDidMount() {
		//FIXME we're using BOTH internal component state and the redux store to contain the list of audit stores.
		//ideally only one should exist.
		this.setLoading(true);
		this.props.dispatch(fetchAuditStores()).then( auditStores =>
		{
			this.setState({auditStores});
			this.setLoading(false);
		});
		this.props.dispatch(fetchProfileInfo());
	}

	render() {
		let rows = this.state.auditStores.map(as => <AuditStoreRow auditStore={as} key={as.id}/>);
		if(this.state.loading){
			return <Loading/>;
		}
		else{
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
}

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		auditStores: store.auditStores,
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditStoreList);

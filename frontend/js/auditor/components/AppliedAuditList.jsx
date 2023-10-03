import React from "react";
import PropTypes from "prop-types";
import ApplicationStatusLabel from "../../components/ApplicationStatusLabel.jsx";
import moment from "moment";
import { momentDateFormat }  from "../../../config.js";
import { findAppliedAudits} from "../service/applied_audits.js";

class AppliedAuditRow extends React.Component{
	static propTypes = {
		// children: PropTypes.node,
		seq:PropTypes.number.isRequired,
		appliedAudit: PropTypes.shape({
			audit_date:PropTypes.string,
			get_brand_name: PropTypes.shape({
				client_name: PropTypes.string,
			}),
			status:PropTypes.string
		})
	};
	render(){
		return (
			<tr>
				<td>
					{this.props.seq}
				</td>
				<td >
					{this.props.appliedAudit.get_brand_name.client_name}
				</td>
				<td >
					<b>{moment(this.props.appliedAudit.audit_date).format(momentDateFormat)}</b>
				</td>
				<td >
					{this.props.appliedAudit.status == "APPLIED"
						?
						<b > <ApplicationStatusLabel status={this.props.appliedAudit.status} /></b>
						: this.props.appliedAudit.status == "APPROVED"
							?
							<b ><ApplicationStatusLabel status= {this.props.appliedAudit.status}/></b>
							: this.props.appliedAudit.status == "WAITLISTED"
								?
								<b ><ApplicationStatusLabel status= {this.props.appliedAudit.status}/></b>
								: this.props.appliedAudit.status == "REJECTED"
									?
									<b ><ApplicationStatusLabel status= {this.props.appliedAudit.status} /> </b>
									: this.props.appliedAudit.status == "WITHDRAWN"
										?
										<b ><ApplicationStatusLabel status= {this.props.appliedAudit.status} /> </b>
										: this.props.appliedAudit.status == "NOT_APPLIED"
											?
											<b ><ApplicationStatusLabel status= {this.props.appliedAudit.status} /> </b>
											: null
					}
				</td>
			</tr>
		);
	}
}

export default class AppliedAuditList extends React.Component{
	static propTypes={
		children : PropTypes.node,
	};
	state={
		appliedAudit:[],
	};
	componentDidMount(){
		findAppliedAudits().then((appliedAudit)=>{
			this.setState({
				appliedAudit
			});
		});
	}
	componentWillReceiveProps(){
		this.componentDidMount();
	}
	render(){
		const rows = this.state.appliedAudit.map((app,i)=><AppliedAuditRow seq={i+1} appliedAudit={app} key={app.id}/>);
		return(
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee"}}>
					Applied Audits
				</h3>
				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>#</th>
								<th>Client Name</th>
								<th>Audit Date</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}


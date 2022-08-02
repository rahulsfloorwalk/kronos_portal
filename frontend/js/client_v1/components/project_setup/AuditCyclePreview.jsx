import React, {Component} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { hashHistory, Link } from "react-router";
import Alert from "react-s-alert";

import Loading from "../../../components/Loading.jsx";
import { find_audit_cycle_for_quotation } from "../../service/quotation.js";

class AuditCyclePreview extends Component{
	static propTypes = {
		quotation: PropTypes.object.isRequired,
		clientId: PropTypes.number.isRequired,
		dispatch: PropTypes.func.isRequired,
	};

	state = {
		loading: false,
		audit_cycle: {},
	};

	componentDidMount(){
		if(this.props.clientId && Object.keys(this.props.quotation).length > 0){
			this.setLoading(true);
			find_audit_cycle_for_quotation(this.props.quotation.id).then((audit_cycle) => {
				this.setState({audit_cycle: audit_cycle, loading: false});
			}).fail(()=>{
				Alert.warning("Please create a audit cycle");
				hashHistory.replace("project_setup/audit_cycle");
			});
		}
	}

	componentWillReceiveProps(ownProps){
		if(ownProps.clientId && Object.keys(ownProps.quotation).length > 0){
			this.setLoading(true);
			find_audit_cycle_for_quotation(ownProps.quotation.id).then((audit_cycle) => {
				this.setState({audit_cycle: audit_cycle, loading: false});
			}).fail(()=>{
				Alert.warning("Please create a audit cycle");
				hashHistory.replace("project_setup/audit_cycle");
			});
		}
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	render(){
		if(this.state.loading == true){
			return <Loading />;
		}
		let {id, name, start_date, end_date, planned_audit, description} = this.state.audit_cycle;
		return(
			<div className="panel panel-default">
				<div className="panel-heading"><b>Audit cycle preview</b></div>
				<div className="panel-body">
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									Name
								</th>
								<th className="text-center">
									Start date
								</th>
								<th className="text-center">
									End date
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="text-center">
									{name}
								</td>
								<td className="text-center">
									{start_date}
								</td>
								<td className="text-center">
									{end_date}
								</td>
							</tr>
						</tbody>
					</table>
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									Planned audits
								</th>
								<th className="text-center">
									Description
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="text-center">
									{planned_audit}
								</td>
								<td className="text-center">
									{description}
								</td>
							</tr>
						</tbody>
					</table>
					<div className="col-md-12 text-center">
						<Link to="project_setup/store" className="btn btn-warning">Back</Link>&nbsp;&nbsp;&nbsp;
						<Link to={`/project_setup/${id}/audit`} className="btn btn-primary">Next</Link>
					</div>
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		quotation: store.quotation || {},
	};
};

export default connect(mapStoreToProps)(AuditCyclePreview);
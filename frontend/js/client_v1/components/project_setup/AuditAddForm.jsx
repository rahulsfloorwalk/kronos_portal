import React, {Component} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Alert from "react-s-alert";
import { hashHistory, Link} from "react-router";
import { storePropType } from "../../prop_types";
import { fetchStores } from "../../actions/store.js";
import Loading from "../../../components/Loading.jsx";
import {addAuditForm} from "../../service/audit.js";
import Jumbotron from "../../../components/Jumbotron.jsx";


class StoreRow extends React.Component {
	static propTypes = {
		store: storePropType,
		error: PropTypes.bool,
		onChange: PropTypes.func,
	};

	state = {
		checked: false,
		audit_count: 0,
	};

	onChange = (e) => {
		let audit_count = e.target.value;
		// if(audit_count !== "" || audit_count == "0"){
		let data = {
			id: this.props.store.id,
			checked: this.state.checked,
			audit_count: audit_count ? parseInt(audit_count) : "",
		};
		this.setState(data);
		this.props.onChange(data);
		// }
	};

	onCheckChange = (e) => {
		let data = {
			id: this.props.store.id,
			checked: e.target.checked,
			audit_count: this.state.audit_count,
		};
		this.setState({
			checked: e.target.checked,
		});
		this.props.onChange(data);
	};

	render() {
		let errorClass = "";
		if(this.props.error){
			errorClass = "danger";
		}
		return (
			<tr>
				<td>
					<input type="checkbox" checked={this.state.checked} onChange={this.onCheckChange}/>
				</td>
				<td width="20%" className={errorClass}>
					<select className="form-control" value={this.state.checked ? this.state.audit_count : ""} disabled={!this.state.checked} onChange={this.onChange}>
						<option value="">---</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
						<option value="10">10</option>
					</select>
				</td>
				<td>{this.props.store.name}</td>
				<td>{this.props.store.address}</td>
				<td>
					{this.props.store.city.name}, <br/>
					{this.props.store.city.state}
				</td>
			</tr>
		);
	}
}


class AuditAddForm extends Component {
	static propTypes = {
		quotation: PropTypes.object,
		clientId: PropTypes.number,
		stores: PropTypes.object,
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string,
		}).isRequired,
	};

	state = {
		loading: false,
		stores: [],
		errors: [],
		non_field_errors: [],
		planned_audits: 0,
		audit_city_list: [],
	};

	componentDidMount() {
		if(this.props.clientId && this.props.quotation){
			let planned_audits = 0;
			let audit_city_list = [];
			for (let i of this.props.quotation.audit_locations){
				planned_audits += i.count;
				audit_city_list.push(i.city.id);
			}
			this.setState({
				planned_audits: planned_audits,
				audit_city_list,
			});
		}
		if(this.props.clientId && Object.keys(this.props.stores).length > 0){
			this.setState({
				loading: true
			});
			this.props.dispatch(fetchStores(this.props.clientId)).always((stores)=>this.setState({
				stores: stores.map((value) => ({
					id: value.id,
					name: value.name,
					address: value.address,
					city: value.city,
					audit_count: 0,
					checked: false,
				})),
				loading:false
			}));
		}
	}

	componentWillReceiveProps(ownProps){
		if (ownProps.clientId && Object.keys(ownProps.quotation).length > 0 && Object.keys(ownProps.stores).length == 0){
			let planned_audits = 0;
			let audit_city_list = [];
			for (let i of ownProps.quotation.audit_locations){
				planned_audits += i.count;
				audit_city_list.push(i.city.id);
			}
			this.setState({
				planned_audits: planned_audits,
				audit_city_list,
				loading: true,
			});
			ownProps.dispatch(fetchStores(ownProps.clientId)).always((stores)=>this.setState({
				stores: stores.map((value) => ({
					id: value.id,
					name: value.name,
					address: value.address,
					city: value.city,
					audit_count: this.setState({
						loading: true
					}),
					checked: false,
				})),
				loading:false
			}));
		}
	}

	onChange = (store_data) => {
		let stores = [];
		for(let s of this.state.stores){
			let store = s;
			if(store.id == store_data.id){
				store["checked"] = store_data.checked;
				store["audit_count"] = store_data.audit_count;
			}
			stores.push(store);
		}
		this.setState({
			stores
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		let errors = [];
		for(let s of this.state.stores){
			if(s.checked == true && (s.audit_count == "" || s.audit_count == 0)){
				errors.push(s.id);
			}
		}
		this.setState({
			errors
		});
		if(errors.length == 0){
			if(confirm("Are you want to sure") == true){
				let audit_cycle_id = this.props.params.auditCycleId;
				let audits = this.state.stores.filter((obj) => obj.checked == true).map((obj) => ({
					store: obj.id,
					count: obj.audit_count,
					audit_cycle: audit_cycle_id
				}));
				let audit_count = 0;
				for(let i of audits){
					audit_count += i.count;
				}
				if(audit_count != this.state.planned_audits){
					alert("Please select audit count same as planned audit count");
					return false;
				}
				let audit_data = {
					audits: audits,
					client_id: this.props.clientId,
				};
				addAuditForm(audit_cycle_id, audit_data).then(() => {
					Alert.success("Audits are created for selected store");
					hashHistory.push(`project_setup/${this.props.params.auditCycleId}/questionnaire`);
				}).fail((err) => {
					if(err.responseJSON.hasOwnProperty("non_field_errors")){
						this.setState({
							non_field_errors: err.responseJSON.non_field_errors,
						});
					}
				});
			}
		}
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		var rows = [];
		let totalRows = 0;
		for(var id in this.state.stores) {
			if(this.state.audit_city_list.includes(this.state.stores[id].city.id) == false){
				continue;
			}
			let store = this.state.stores[id];
			let error = this.state.errors.includes(store.id);
			if(this.state.stores[id].checked == true){
				totalRows += this.state.stores[id].audit_count ? this.state.stores[id].audit_count : 0;
			}
			rows.push(<StoreRow onChange={this.onChange} key={store.id} store={store} error={error}/>);
		}
		let jumboNode = (
			<div className="text center">
				<p>Please click here to insert stores</p>
				<Link to="project_setup/store" className="btn btn-primary">Insert Store</Link>
			</div>
		);
		return (
			<div className="row">
				<div className="col-md-8">
					<div className="panel panel-default">
						<div className="panel-heading" style={{display: "flex", justifyContent: "space-between", alignItems:"center" }}>
							<b>Insert audits</b>
						</div>
						<div className="panel-body">
							<div className="table-responsive">
								<table className="table table-striped">
									<thead>
										<tr>
											<th>#</th>
											<th>Audit Count</th>
											<th>Store Name</th>
											<th>Address</th>
											<th>City</th>
										</tr>
									</thead>
									<tbody>
										{rows.length == 0 ? <tr><td colSpan={5}><Jumbotron heading="Store not found to create audit" node={jumboNode} /></td></tr> : rows}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-4">
					<div className="panel panel-default">
						<div className="panel-heading" style={{display: "flex", justifyContent: "space-between", alignItems:"center" }}>
							<b>Preview</b>
						</div>
						<div className="panel-body">
							<div className="table-responsive">
								<table className="table table-striped">
									<tbody>
										<tr>
											<td>Planned audits</td>
											<td>{this.state.planned_audits}</td>
										</tr>
										<tr>
											<td>Selected audits</td>
											<td>{totalRows}</td>
										</tr>
										<tr>
											<td colSpan={2} className="text-center">
												{this.state.planned_audits !== totalRows ? <p className="text-danger">
													Please select audit count as per planned audits
												</p>
													: null}
												{this.state.non_field_errors ? <p className="text-danger">{this.state.non_field_errors}</p> : null}
												<input type="button" className="btn btn-success" value="Submit" disabled={this.state.planned_audits !== totalRows} onClick={(e) => this.onSubmit(e)} />
											</td>
										</tr>
										<tr>
											<td colSpan={2} className="text-center">
												<hr/>
												<Link to="project_setup/audit_cycle_preview" className="btn btn-warning">Back</Link>
												&nbsp;&nbsp;
												<Link to={`project_setup/${this.props.params.auditCycleId}/questionnaire`} className="btn btn-primary">Skip</Link>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		stores: store.stores,
		quotation: store.quotation || {},
	};
};

export default connect(mapStoreToProps)(AuditAddForm);
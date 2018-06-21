import React, { Component } from "react";
import PropTypes from "prop-types";
import { } from "react-router";

import { } from "../../styles.js";

import Loading from "../../components/Loading.jsx";

import QuestionnaireTrends from "./QuestionnaireTrends.jsx";
import StorePerformance from "./StorePerformance.jsx";

import { getAuditType } from "../../utils.js";
import { } from "../../components/Icons.jsx";

import { fetchStore } from "../service/store.js";
import { fetchAuditTypes } from "../service/dashboard.js";

export default class StoreTrends extends Component{
	static propTypes = {
		params: PropTypes.shape({
			storeId: PropTypes.string.isRequired,
		}),
	};

	state = {};

	reloadReport = (storeId, audit_type=undefined) => {
		fetchStore(storeId).then((store)=>{
			if(!audit_type){
				switch(store.type){
				case "Fine Dine":
					audit_type = "FINE_DINE";
					break;
				case "Sky Karting":
					audit_type = "SKY_KARTING";
					break;
				case "Arena":
				case "":
				case undefined:
				case null:
				default:
					audit_type = "WALKIN";
					break;
				}
			}

			this.setState({
				audit_type,
			});
		});
	};

	componentDidMount() {
		fetchAuditTypes().then(types => {
			//let audit_type = types.indexOf("WALKIN") > -1 ? "WALKIN" : types[0];

			this.setState({
				types,
				//audit_type,
			});

			this.reloadReport(this.props.params.storeId);
		});
	}

	auditTypeChanged = (e) => {
		this.reloadReport(this.props.params.storeId, e.target.value);
		this.setState({
			audit_type: e.target.value,
		});
	};

	render(){
		if(!this.state.types){
			return <Loading/>;
		}

		return(<div>
			<h3 className="page-header">
				Store Performance
				<div className="pull-right">
					<select className="form-control input-lg" value={this.state.audit_type} onChange={this.auditTypeChanged}>
						{this.state.types.map((type) => <option key={type} value={type}>{getAuditType(type)}</option>)}
					</select>
				</div>
			</h3>
			{ this.state.audit_type ?
				<div>
					<StorePerformance store_id={this.props.params.storeId} audit_type={this.state.audit_type}/>
					<QuestionnaireTrends storeId={parseInt(this.props.params.storeId)} audit_type={this.state.audit_type}/>
				</div>
				: null }
		</div>);
	}
}

import React from "react";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../../../config.js";

import { fetchUpcomingAuditStores } from "../service/audit_store.js";

import Loading from "../../components/Loading.jsx";
import { Time } from "../../components/Icons.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";

export default class UpcomingAuditStores extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	state = {
		loading: false,
		groupedAuditStores: {}
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	componentDidMount() {
		localStorage.removeItem("selectedTwitterHandle");
		this.setLoading(true);
		fetchUpcomingAuditStores().then((auditStores) => {
			let groupedAuditStores = {};
			auditStores.forEach( as => {
				if( ! groupedAuditStores[as.audit_date]){
					groupedAuditStores[as.audit_date] = [];
				}
				groupedAuditStores[as.audit_date].push(as);
			});
			this.setState({
				groupedAuditStores
			});
		}).always(() => this.setLoading(false));
	}

	render() {
		if(this.state.loading){
			return <Loading/>;
		}
		let rows = [];
		for(let key in this.state.groupedAuditStores) {
			let innerRows = [];

			for( let as of this.state.groupedAuditStores[key]){
				innerRows.push(
					<div className="row" key={as.id}>
						<div className="col-md-12"><br/></div>
						<div className="col-md-3">{as.audit.audit_cycle.name}</div>
						<div className="col-md-2">{as.audit.store.city.name}</div>
						<div className="col-md-5">
							{as.audit.store.name}<br/>
							<small className="text-muted">{as.audit.store.address}</small>
						</div>
						<div className="col-md-2">
							{as.audit.audit_cycle.questionnaire_type && as.audit.audit_cycle.questionnaire_type.name}
						</div>
					</div>
				);
			}

			rows.push(
				<div className="row" key={key}>
					<div className="col-md-12"><hr/></div>
					<div className="col-md-3">
						<h3>
							{moment(key).format(momentDateFormat)}
						</h3>
					</div>
					<div className="col-md-9">
						{innerRows}
						<div className="col-md-12"><br/></div>
					</div>
				</div>
			);
		}
		if(rows.length > 0){
			return (
				<div>
					<div className="row">
						<div className="col-md-3">
							<h3><Time/> Upcoming Audits</h3>
						</div>
						<div className="col-md-9">
							<div className="row">
								<div className="col-md-3"><h3>Audit Cycle</h3></div>
								<div className="col-md-2"><h3>City</h3></div>
								<div className="col-md-5"><h3>Store</h3></div>
								<div className="col-md-2"><h3>Audit Type</h3></div>
							</div>
						</div>
					</div>
					{rows}
					{this.props.children}
				</div>
			);
		} else {
			return (<Jumbotron heading="there are no upcoming audits right now" para=""/>);
		}
	}
}

import React from "react";
import PropTypes from "prop-types";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { File } from "../../../components/Icons.jsx";

const AuditStoreDetailsBox = (props) => {
	return (<div className="panel panel-primary">
		<div className="panel-heading">
			<h4 className="panel-title"><File/> Audit Details</h4>
		</div>
		<table className="table table-striped">
			<tbody>
				<tr>
					<td className="text-right">Client:</td>
					<th>{props.auditStore.audit.store.client.name}</th>
				</tr>
				{ props.auditStore.audit.store.code ?
					<tr>
						<td className="text-right">Store Code:</td>
						<th>{props.auditStore.audit.store.code}</th>
					</tr>
					: null }
				<tr>
					<td className="text-right">Store:</td>
					<th>{props.auditStore.audit.store.name}</th>
				</tr>
				<tr>
					<td className="text-right">Store Type:</td>
					<th>{props.auditStore.audit.store.type}</th>
				</tr>
				{ props.auditStore.audit.store.priority ?
					<tr>
						<td className="text-right">Store Priority:</td>
						<th>{props.auditStore.audit.store.priority}</th>
					</tr>
					: null }
				<tr>
					<td className="text-right">Audit Type:</td>
					<th>
						{props.auditStore.audit.audit_cycle.questionnaire_type && props.auditStore.audit.audit_cycle.questionnaire_type.name}
					</th>
				</tr>
				<tr>
					<td className="text-right">Address:</td>
					<th>{`${props.auditStore.audit.store.address}, ${props.auditStore.audit.store.city.name}`}</th>
				</tr>
				<tr>
					<td className="text-right">Audit Date:</td>
					<th>{moment(props.auditStore.audit_date).format(momentDateFormat)}</th>
				</tr>
				<tr>
					<td className="text-right">Total Score:</td>
					<th>
						<div className="progress">
							<div className={"progress-bar"} role="progressbar" aria-valuenow={props.auditStore.percentage} aria-valuemin="0" aria-valuemax="100" style={{width: props.auditStore.percentage + "%"}}>
								{props.auditStore.percentage}%
							</div>
						</div>
					</th>
				</tr>
			</tbody>
		</table>
	</div>);
};

AuditStoreDetailsBox.propTypes = {
	auditStore: PropTypes.shape({
		audit_date: PropTypes.string.isRequired,
		percentage: PropTypes.number,
		audit: PropTypes.shape({
			audit_cycle: PropTypes.shape({
				type: PropTypes.string,
				client: PropTypes.shape({
					id: PropTypes.number.isRequired,
					name: PropTypes.string.isRequired,
				}).isRequired,
				questionnaire_type: PropTypes.shape({
					name: PropTypes.string.isRequired,
				}),
			}).isRequired,
			store: PropTypes.shape({
				name: PropTypes.string,
				type: PropTypes.string,
				code: PropTypes.string,
				priority: PropTypes.string,
				address: PropTypes.string,
				client: PropTypes.shape({
					name: PropTypes.string.isRequired,
				}).isRequired,
				city: PropTypes.shape({
					id: PropTypes.number.isRequired,
					name: PropTypes.string.isRequired,
				}).isRequired,
			}).isRequired,
		}).isRequired,
	}).isRequired,
};


export default AuditStoreDetailsBox;

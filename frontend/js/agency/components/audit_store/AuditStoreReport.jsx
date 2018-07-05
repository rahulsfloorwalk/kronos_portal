import React from "react";
import PropTypes from "prop-types";

import Loading from "../../../components/Loading.jsx";

import { fetchAuditStore } from "../../service/audit_store.js";

import AuditStoreDetails from "./AuditStoreDetails.jsx";

export default class AuditStoreReport extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditStoreId: PropTypes.string.isRequired,
		}),
	};

	state = {
		submitMessage : "",
		submitStatus: "",
		showErrors: false,
	};

	componentDidMount() {
		fetchAuditStore(this.props.params.auditStoreId).then(auditStore => {
			this.setState({ auditStore });
		});
	}

	render(){
		if(this.state.auditStore) {
			return <AuditStoreDetails auditStore={this.state.auditStore}/>;
		} else {
			return <Loading/>;
		}
	}
}

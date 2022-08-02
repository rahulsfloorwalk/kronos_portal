import React, {Component} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {Link} from "react-router";

import StoreList from "./StoreList.jsx";
import StoreAddForm from "./StoreAddForm.jsx";
import { DownloadAlt } from "../../../../components/Icons.jsx";

class StoreDetail extends Component {
	static propTypes = {
		children: PropTypes.node,
	};
	render(){
		return (
			<div>
				<div className="col-md-4">
					<div className="panel panel-default">
						<div className="panel-heading">
							<div className="pull-right">
								<Link to="/project_setup/store/import" className="btn btn-primary btn-sm"><DownloadAlt/>&nbsp;&nbsp;<b>Import</b></Link>
							</div>
							<h5><b>Insert new store</b></h5>
						</div>
						<div className="panel-body">
							<StoreAddForm />
						</div>
					</div>
				</div>
				<div className="col-md-8">
					<div className="panel panel-default">
						<div className="panel-heading">
							<div className="pull-right">
								<Link to="/project_setup/quotation" className="btn btn-warning btn-sm"><b>Back</b></Link>
								&nbsp;&nbsp;
								<Link to="/project_setup/audit_cycle" className="btn btn-primary btn-sm"><b>Next</b></Link>
							</div>
							<h5><b>Preview store list</b></h5>
						</div>
						<div className="panel-body">
							<StoreList />
						</div>
					</div>
				</div>
				{this.props.children}
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

export default connect(mapStoreToProps)(StoreDetail);
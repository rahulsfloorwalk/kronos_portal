import React, { Component } from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import Alert from "react-s-alert";
import { get_uncomplete_quotation_by_client } from "../../actions/quotation.js";

class ProjectSetupDetail extends Component {
	static propTypes = {
		clientId: PropTypes.number,
		quotation: PropTypes.object,
		dispatch: PropTypes.func,
		children: PropTypes.node,
	};

	componentDidMount(){
		if(this.props.clientId){
			this.props.dispatch(get_uncomplete_quotation_by_client(this.props.clientId)).fail(() => {
				Alert.warning("Please setup your project");
				hashHistory.replace("project_setup/quotation");
			});
		}
	}

	componentWillReceiveProps(ownProps){
		if(this.props.clientId != ownProps.clientId){
			ownProps.dispatch(get_uncomplete_quotation_by_client(ownProps.clientId)).fail(() => {
				Alert.warning("Please setup your project");
				hashHistory.replace("project_setup/quotation");
			});
		}
	}
	render(){
		return (
			<div>
				<h2>Project setup</h2>
				<hr/>
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

export default connect(mapStoreToProps)(ProjectSetupDetail);
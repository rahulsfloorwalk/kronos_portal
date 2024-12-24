import React from "react";
import * as ReactRedux from "react-redux";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";
import $ from "jquery";

import Alert from "react-s-alert";

import { fetchStores } from "../../actions/store.js";

import { fetchClientUser, getAssignStoresForNonAdminUser, assignStoresForNonAdminUser } from "../../service/client_user.js";

import { getInputEventChangeValue } from "../../../react_utils.js";
import SaveButton from "../../../components/SaveButton.jsx";
import Modal from "../../../components/Modal.jsx";

class ClientUserAssignStores extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
			clientUserId: PropTypes.string.isRequired,
		}),
		stores: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			clientUser: null,
			client_user_store_list: [],
			errorMsg: "",
		};
	}
	componentDidMount() {
		this.props.dispatch(fetchStores(this.props.params.clientId));
		this.setState({
			"client": this.props.params.clientId
		});
		if(this.props.params.clientUserId){
			getAssignStoresForNonAdminUser(this.props.params.clientUserId).done((store_data)=>{
				this.setState({
					client_user_store_list: store_data["store_list"]
				});
			});
			fetchClientUser(this.props.params.clientUserId).done((clientUser)=>{
				this.setState({
					clientUser,
					full_name : clientUser.full_name,
					email : clientUser.user.email,
				});
			});
		}
	}

	fieldChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	onSubmit = (e) => {
		e.preventDefault();
		let save_client_user_store_list = [];
		$(".row input:checked").each(function() {
			let val = parseInt($(this).attr("value"));
			save_client_user_store_list.push(val);
		});
		// if(save_client_user_store_list.length === 0){
		// 	this.setState({
		// 		errorMsg: "Please select at least one store"
		// 	});
		// }
		// else{
		// 	assignStoresForNonAdminUser(this.props.params.clientUserId, save_client_user_store_list).then(() => {
		// 		hashHistory.goBack();
		// 		Alert.success("STORES ASSIGNED");
		// 	});
		// }
		assignStoresForNonAdminUser(this.props.params.clientUserId, save_client_user_store_list).then(() => {
			hashHistory.goBack();
			Alert.success("STORES ASSIGNED");
		});
	};

	render(){
		let client_user_store_list = this.state.client_user_store_list;
		let store_rows = [];
		for (let s in client_user_store_list){
			if (client_user_store_list[s]["present"]){
				store_rows.push(
					<div className="col-sm-6 col-md-6" key={s}>
						<label style={{fontSize:"14px",marginBottom:"10px"}}><input type="checkbox" value={client_user_store_list[s]["id"]} defaultChecked style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {client_user_store_list[s]["name"]}, {client_user_store_list[s]["city_name"]}</span></label>
					</div>
				);
			}
			else{
				store_rows.push(
					<div className="col-sm-6 col-md-6" key={s}>
						<label style={{fontSize:"14px",marginBottom:"10px"}}><input type="checkbox" value={client_user_store_list[s]["id"]} style={{verticalAlign:"bottom",width:"20px",height:"20px"}} /><span> {client_user_store_list[s]["name"]}, {client_user_store_list[s]["city_name"]}</span></label>
					</div>
				);
			}
		}
		var modalTitle = "Assign Stores";
		return (
			<Modal modalTitle={modalTitle} size="modal-lg" onClose={hashHistory.goBack}>
				<form onSubmit={this.onSubmit}>
					<p style={{fontSize:"16px"}}>Full Name: <b>{this.state.full_name}</b></p>
					<p style={{fontSize:"16px"}}>Email: <b>{this.state.email}</b></p>
					<div className="row" style={{paddingBottom:"3%", paddingTop:"3%"}}>
						{store_rows}
					</div>
					<SaveButton/> &nbsp;
					<span style={{color:"red"}}><b>{this.state.errorMsg}</b></span>
				</form>
			</Modal>
		);
	}
}


var mapStoreToProps = function(store){
	return {
		stores: store.stores,

	};
};

export default ReactRedux.connect(mapStoreToProps)(ClientUserAssignStores);
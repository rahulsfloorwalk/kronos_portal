import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";
import Modal from "../../../components/Modal.jsx";

import { uploadFileForImportStore } from "../../../client_v1/service/store.js";
import { fetchStores } from "../../actions/store.js";

import { Upload, Download } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";
import {url}  from "../../../../config.js";


class StoreImportForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			clientId: PropTypes.string.isRequired,
		}),
		dispatch: PropTypes.func,
	};

	constructor(props) {
		super(props);
		this.uploadInput = null;
	}

	state = {
		uploadMessage : "",
		uploading: false
	};

	uploadButtonClicked = () => {
		this.uploadInput.click();
	};

	uploadFile = () => {
		if( this.uploadInput.files.length > 1){
			alert("You can only upload 1 attachments at once");
			return;
		}
		for( let toUploadFile of this.uploadInput.files){
			this.setState({
				uploading: true,
				uploadMessage: ""
			});
			var promise = uploadFileForImportStore(this.props.params.clientId ,toUploadFile);
			promise.always(()=>{
				this.setState({
					uploading:false,
				});
				this.uploadInput.value = "";
			});
			promise.then(()=>{

				this.props.dispatch(fetchStores(this.props.params.clientId));
				hashHistory.push(`/projects/${this.props.params.clientId}/store`);
				Alert.success("STORE SAVED");

			}, (errorMessage) => {
				this.setState({
					uploadMessage: errorMessage.responseJSON.non_field_errors,
				});
				this.uploadInput.value = "";
			});
		}
	};

	render() {

		let uploadButton = (
			<p>
				<button onClick={this.uploadButtonClicked} type="button" className="btn btn-primary btn-sm"><Upload/> Upload sheet</button>
				&nbsp;&nbsp;
				<a className="btn btn-default btn-sm" href={url.api_base_path + "client_v1/store/import/sample"}>
					<Download/> Download sample sheet
				</a>
			</p>
		);

		return (
			<Modal modalTitle="Import Stores" onClose={hashHistory.goBack}>
				<input type="file" multiple
					onChange={this.uploadFile}
					disabled={this.state.uploading}
					ref={(input)=>this.uploadInput = input}
					style={{"display":"none"}}/>

				<div className="list-group">
					<div key="empty" className="list-group-item text-muted">
						<div className="text-center">
							{this.state.uploading == false ? <p>{uploadButton}</p> : null}
							{this.state.uploading == true ? <Loading /> : null}
							{this.state.uploadMessage ? <p className="text-danger"><br/>{this.state.uploadMessage}</p> : null}
							<br/>
						</div>
						<div style={{display: "flex", "justifyContent": "center"}}>
							<ol style={{display:"inline-block"}}>
								<li>
									Only .xlsx format is supported
								</li>
								<li>
									All code must be unique
								</li>
								<li>
									All cities name must be same as per in portal
								</li>
							</ol>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default ReactRedux.connect()(StoreImportForm);
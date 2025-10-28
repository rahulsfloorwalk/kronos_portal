import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Alert from "react-s-alert";
import Modal from "../../../components/Modal.jsx";

// import { uploadFileForImportStore } from "../../../manager/service/store.js";
// import { fetchStores } from "../../actions/store.js";

import { Upload, Download } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";
import { url } from "../../../../config.js";
import { uploadFileForImportQuestionnaire } from "../../service/questionnaire.js";


class QuestionnaireImportForm extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.number.isRequired,
		}),
		dispatch: PropTypes.func
	};

	constructor(props) {
		super(props);
		this.uploadInput = null;
	}

	state = {
		uploadMessage: "",
		uploading: false
	};

	uploadButtonClicked = () => {
		this.uploadInput.click();
	};

	uploadFile = () => {
		if (this.uploadInput.files.length > 1) {
			alert("You can only upload 1 attachments at once");
			return;
		}
		for (let toUploadFile of this.uploadInput.files) {
			this.setState({
				uploading: true,
				uploadMessage: ""
			});
			var promise = uploadFileForImportQuestionnaire(this.props.params.auditCycleId, toUploadFile);
			promise.always(() => {
				this.setState({
					uploading: false,
				});
				this.uploadInput.value = "";
			});
			promise.then(() => {
				Alert.success("Section Added Successfully");
				hashHistory.push(`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`);
			}, (errorMessage) => {
				let errorMsg = "";
				if (errorMessage.responseJSON.non_field_errors) {
					errorMsg = errorMessage.responseJSON.non_field_errors.join(", ");
				}
				else if (errorMessage.responseJSON.detail) {
					errorMsg = errorMessage.responseJSON.detail;
				}
				else {
					errorMsg = "Something went wrong while uploading.";
				}
				this.setState({ uploadMessage: errorMsg });
				this.uploadInput.value = "";
			});

		}
	};

	render() {

		let uploadButton = (
			<p>
				<button onClick={this.uploadButtonClicked} type="button" className="btn btn-primary btn-sm"><Upload /> Upload sheet</button>
				&nbsp;&nbsp;
				<a className="btn btn-default btn-sm" href={url.api_base_path + "manager/questionnaire/import/sample"}>
					<Download /> Download sample sheet
				</a>
			</p >
		);

		return (
			<Modal modalTitle="Import Questionnaire" onClose={hashHistory.goBack}>
				<input type="file" multiple
					onChange={this.uploadFile}
					disabled={this.state.uploading}
					ref={(input) => this.uploadInput = input}
					style={{ "display": "none" }} />

				<div className="list-group">
					<div key="empty" className="list-group-item text-muted">
						<div className="text-center">
							{this.state.uploading == false ? <p>{uploadButton}</p> : null}
							{this.state.uploading == true ? <Loading /> : null}
							{this.state.uploadMessage ? <p className="text-danger"><br />{this.state.uploadMessage}</p> : null}
							<br />
						</div>
						<div style={{ display: "flex", "justifyContent": "center" }}>
							<ol style={{ display: "inline-block" }}>
								<li>
									Only .xlsx format is supported
								</li>
								<li>
									For inserting sections, only Sequence no. and name is required (Skip filling rest columns)
								</li>
								<li>
									All questions must be mapped with respective question type, options & their marks
								</li>
								<li>
									All question type must be - PLAIN, MUTEX or MULTISELECT
								</li>
								<li>
									Impact factors, hide question & question comments are optional
								</li>
								<li>
									For hiding question & adding question comment, the value must be TRUE
								</li>
								<li>
									No spelling mistakes will be accepted in the entire import format
								</li>
							</ol>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default QuestionnaireImportForm;
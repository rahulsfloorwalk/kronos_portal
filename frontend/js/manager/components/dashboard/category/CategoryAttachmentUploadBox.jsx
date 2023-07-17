import React from "react";
import PropTypes from "prop-types";
import { findAttachmentsByCategory, deleteCategoryAttachment, uploadFileForCategories, findCategoryById } from "../../../service/admin_dashboard.js";
import { Link } from "react-router";
import { Paperclip, Cross } from "../../../../components/Icons.jsx";
import CAttachmentThumbnail from "./CAttachmentThumbnail.jsx";
import CAttachmentInProgress from "./CAttachmentInProgress.jsx";
import CAttachmentPreview from "./CAttachmentPreview.jsx";
import Alert from "react-s-alert";

export default class CategoryAttachmentUploadBox extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			categoryId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
	};
	state = {
		uploadMessage: "",
		attachments: [],
		inProgress: {},
		progress: "",
		expanded: false,
		uploading: false,
		selectedAttachment: undefined,
		loading: false,
		category: {},
	};

	toggleExpand = () => {
		this.setState({ expanded: !this.state.expanded });
	};

	reloadState = () => {
		findAttachmentsByCategory(this.props.params.categoryId).then((attachments) => {
			this.setState({
				attachments
			});
		});
	};

	componentDidMount() {
		if (this.props.params.categoryId) {
			findCategoryById(this.props.params.categoryId).then((category) => {
				this.setState({
					category: Object.assign({}, category)
				});
			}).always(() => this.setLoading(false));
		}
		this.reloadState();
	}

	uploadButtonClicked = () => {
		if (this.state.attachments.length > 0) {
			Alert.warning("You must delete the previously uploaded image before uploading a new one");
			return;
		}
		this.uploadInput.click();
	};
	setProgressState = (tempId, progressState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				inProgress: Object.assign({}, prevState.inProgress, {
					[tempId]: Object.assign({}, prevState.inProgress[tempId], progressState)
				})
			});
		});
	};

	uploadFile = () => {
		if (this.uploadInput.files.length > 10) {
			alert("You can only upload 10 attachments at once");
			return;
		}
		for (let toUploadFile of this.uploadInput.files) {
			let tempId = Math.random().toString(36).substring(7);
			this.setProgressState(tempId, {
				uploading: true,
				file: toUploadFile
			});
			var promise = uploadFileForCategories(this.props.params.categoryId, toUploadFile);
			promise.progress((type, percent) => {
				if (type === "INIT") {
					this.setProgressState(tempId, {
						uploadMessage: "initializing upload",
						active: false,
					});
				}
				if (type === "STARTING_UPLOAD") {
					this.setProgressState(tempId, {
						uploadMessage: "starting upload",
						active: true,
					});
				}
				if (type === "UPLOAD_PROGRESS") {
					this.setProgressState(tempId, {
						uploadMessage: "",
						progress: Math.floor(percent)
					});
				}
			});
			promise.always(() => {
				this.setProgressState(tempId, {
					progress: "",
					uploading: false,
					active: false
				});
			});
			promise.then(() => {
				this.setProgressState(tempId, {
					uploadMessage: "upload successful",
				});
				this.reloadState();
			}, (errorMessage) => {
				this.setProgressState(tempId, {
					uploadMessage: errorMessage,
					error: true,
				});
			});
		}
	};

	attachmentSelected = (attachment) => {
		this.setState({
			selectedAttachment: attachment
		});
	};

	attachmentDeleteClicked = (attachment) => {
		deleteCategoryAttachment(attachment.id, this.props.params.categoryId).then(() => {
			this.reloadState();
		});
	};
	handleSelectedAttachment = ()=>{
		this.setState({
			selectedAttachment: null,
		});
	};
	render() {
		let uploadButton = (<button onClick={this.uploadButtonClicked} type="button" className="btn btn-default pull-right"><Paperclip /> Upload</button>);
		let deletable = true;
		var attachmentRows = [];

		for (let a of this.state.attachments) {
			attachmentRows.push(<CAttachmentThumbnail
				attachment={a}
				deletable={deletable}
				onDelete={() => this.attachmentDeleteClicked(a)}
				onSelect={() => this.attachmentSelected(a)}
				selected={a.id === (this.state.selectedAttachment && this.state.selectedAttachment.id)}
				key={a.id}
			/>);
		}

		for (let id in this.state.inProgress) {
			if (this.state.inProgress[id].uploading || this.state.inProgress[id].error) {
				let fileName = this.state.inProgress[id].file ? this.state.inProgress[id].file.name : "";
				attachmentRows.push(<CAttachmentInProgress
					key={id}
					fileName={fileName}
					progress={this.state.inProgress[id].progress}
					uploadMessage={this.state.inProgress[id].uploadMessage}
					error={this.state.inProgress[id].error}
				/>);
			}
		}
		if (attachmentRows.length === 0) {
			attachmentRows.push(
				<div key="empty" className="text-muted" style={{ padding: "2rem 4rem", fontSize: "2rem", }}>
				No Attachments here
				</div>
			);
		}

		let attachmentElement = <CAttachmentPreview attachment={this.state.selectedAttachment}
			section_id={0}
			handleSelectedAttachment = {this.handleSelectedAttachment}
			onChange={(e) => this.saveAttachmentTag(this.state.selectedAttachment.id, e)}
		/>;

		let panelClass = this.state.attachments.length > 0 ? "panel-success-hoverable" : "panel-default";
		let toShow = this.state.expanded || this.state.attachments.length === 0;

		return (
			<div className={"panel " + panelClass}>
				<div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
					<Link to="/admindashboard/category">   <Cross /></Link>
				</div>
				<div className="panel-heading" style={{ cursor: "pointer" }} onClick={this.toggleExpand}>
					<input type="file"
						onChange={this.uploadFile}
						disabled={this.state.uploading}
						ref={(input) => this.uploadInput = input}
						style={{ "display": "none" }} />
					{uploadButton}
					<h4>
					Attachment for <b>{this.state.category.name}</b><span className="text-danger" style={{ marginLeft: ".5rem" }}><b>*</b></span>
					</h4>
				</div>
				{toShow ?
					<div className="row">
						<div className="list-group" style={{ "height": "150px", "overflowY": "auto", padding: "2rem" }}>
							{attachmentRows}
						</div>
						<div className="col-md-12">
							{attachmentElement}
						</div>
					</div>
					: null}

			</div>
		);
	}
}
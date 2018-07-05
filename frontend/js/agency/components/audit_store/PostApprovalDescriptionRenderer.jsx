import React from "react";
import PropTypes from "prop-types";

import MarkdownViewer from "../../../components/MarkdownViewer.jsx";

const PostApprovalDescriptionRenderer = (props) => {
	if(props.audit.post_approval_description || props.audit.audit_cycle.post_approval_description){
		return (<div className="panel-body">
			<MarkdownViewer markdown={props.audit.post_approval_description || ""}/>
			<MarkdownViewer markdown={props.audit.audit_cycle.post_approval_description || ""}/>
		</div>);
	} else {
		return null;
	}
};

PostApprovalDescriptionRenderer.propTypes = {
	audit: PropTypes.shape({
		post_approval_description: PropTypes.string,
		audit_cycle: PropTypes.shape({
			post_approval_description: PropTypes.string,
		}).isRequired,
	}).isRequired,
};

export default PostApprovalDescriptionRenderer;

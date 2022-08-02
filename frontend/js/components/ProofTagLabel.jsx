import React from "react";
import PropTypes from "prop-types";

import { Checked, Cross } from "../components/Icons.jsx";

export default class ProofTagLabel extends React.Component {
	static propTypes = {
		proof_tag: PropTypes.object.isRequired,
		attached: PropTypes.bool,
		is_required: PropTypes.bool,
	};

	render() {
		let {proof_tag, attached, is_required} = this.props;
		let icon = attached ? <Checked /> : <Cross />;
		let label_class = attached ? "label label-primary" : is_required ? "label label-danger" : "label label-warning";
		return <span className={label_class} style={{ marginRight: "10px" }}>{icon}&nbsp;{proof_tag.proof_tag} (max {proof_tag.max_attachment_count})</span>;
	}
}

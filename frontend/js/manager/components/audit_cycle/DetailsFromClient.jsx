import React from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import Modal from "../../../components/Modal.jsx";
class DetailsFromClient extends React.Component{
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}),
	};
	render(){
		return (
			<Modal modalTitle={"Details From Client"} onClose={hashHistory.goBack}>
				<p>Arpan</p>
			</Modal>
		);
	}
}
export default DetailsFromClient;

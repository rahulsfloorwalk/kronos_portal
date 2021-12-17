import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import Tour from "reactour";

import { fetchAdditionalInfo, saveAdditionalInfo } from "../actions/additional_info.js";

class SiteTourBox extends React.Component {
	static propTypes = {
		is_tour_complete: PropTypes.bool,
		dispatch: PropTypes.func.isRequired,
	};

	componentDidMount(){
		this.props.dispatch(fetchAdditionalInfo());
	}

	closeTour = () => {
		this.props.dispatch(saveAdditionalInfo({is_tour_complete:true}));
	};

	render() {
		const steps = [
			{
				content: "Thank you for choosing FloorWalk to begin your Mystery Shopping journey. Click on the begin button below to start a quick tour of how the portal works.",
			},
			{
				selector: ".profiletourclass",
				content: (<div style={{overflowY:"auto"}}><p>Start by clicking on <b>My Profile</b> to fill your basic information. This helps us to show you relevant projects that are available near you. Try completing 100% of your profile to get maximum audits.</p></div>),
			},
			{
				selector: ".audittourclass",
				content: (<p>Under the audits tab, you see projects that are available for you based on your city, state and pincode entered. Read the audit assignment process to know how the process works. Do not conduct audits if they are not assigned to you.</p>),
			},
			{
				selector: ".reporttourclass",
				content: (<ul><li>All approved audit applications will be visible over here</li><li>You will use this tab to fill and submit the reports.</li></ul>),
			},
			{
				selector: ".paymenttourclass",
				content: (<ul><li>Payment will be transferred into your bank account within 45 days after the completion of the respective month of your report submission.</li><li>This tab can be used to track all the pending and paid payments in your account.</li></ul>),
			},
			{
				selector: ".guidetourclass",
				content: (<ul><li>You can find the entire knowledge base for Mystery Shopping and auditor experiences to make your journey easy.</li></ul>),
				action: node => {
					node.focus();
				},
			},
		];
		if(this.props.is_tour_complete == false){
			return (
				<Tour
					steps={steps}
					isOpen={!this.props.is_tour_complete}
					onRequestClose={this.closeTour}
					disableInteraction={true}
					lastStepNextButton={<button className="btn btn-primary">Get started...</button>} />
			);
		}
		else{
			return null;
		}
	}
}

var mapStoreToProps = function(store){
	return {
		is_tour_complete: store.additionalInfo.is_tour_complete,
	};
};

export default ReactRedux.connect(mapStoreToProps)(SiteTourBox);
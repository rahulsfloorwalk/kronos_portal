import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import { pointerStyle } from "../../styles.js";

import { Check, Warning, Pencil, Cross } from "../../components/Icons.jsx";

import { getCameraResolution, getCarCost, getIndustry, getInterestArea,getLanguageList, getOccupation } from "../../utils.js";
import { fetchAdditionalInfo } from "../actions/additional_info.js";

import { additionalInfoPropType } from "../prop_types";

class AdditionalInfoPanelBase extends React.Component {
	static propTypes =  {
		dispatch: PropTypes.func.isRequired,
		additionalInfo: additionalInfoPropType,
	};

	state = {
		expanded: false,
	};

	toggleExpand = () => {
		this.setState({expanded: !this.state.expanded});
	};

	componentDidMount() {
		this.props.dispatch(fetchAdditionalInfo());
	}

	render() {
		var has_car = this.props.additionalInfo.has_car ? <Check/> : <Cross/>;
		var laptop_owned = this.props.additionalInfo.laptop_owned ? <Check/> : <Cross/>;
		let panelClass = this.props.additionalInfo.is_complete ? "panel-success-hoverable" : "panel-default";
		let panelIcon = this.props.additionalInfo.is_complete ? <Check/> : <Warning/>;
		let interest_area_list = "";
		let language_list = "";
		if(this.props.additionalInfo.language_known){
			for(let i of this.props.additionalInfo.language_known){
				language_list += getLanguageList(i) + ", ";
			}
		}
		if(this.props.additionalInfo.interest_area){
			for(let i of this.props.additionalInfo.interest_area){
				interest_area_list += getInterestArea(i) + ", ";
			}
		}
		return (
			<div className={"panel " + panelClass}>
				<div className="panel-heading" style={pointerStyle} onClick={this.toggleExpand}>
					<Link to="details/additional/edit" className="btn btn-default pull-right"><Pencil/> Edit</Link>
					<h4>{panelIcon} Additional Info</h4>
				</div>
				{ this.state.expanded || !this.props.additionalInfo.is_complete ?
					<table className="table table-striped">
						<colgroup>
							<col style={{width:"40%"}}/>
						</colgroup>
						<tbody>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Referral Code:</td><th>{ this.props.additionalInfo.referral_code }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Occupation:</td><th>{ getOccupation(this.props.additionalInfo.occupation) }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Preferred Distance (km):</td><th>{ this.props.additionalInfo.distance }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Interest area:</td><th>{ interest_area_list }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Language Known:</td><th>{ language_list }</th></tr>
							
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Industry:</td><th>{ getIndustry(this.props.additionalInfo.industry) }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Company:</td><th>{ this.props.additionalInfo.company }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Car Owned?:</td><th>{ has_car }</th></tr>
							{ this.props.additionalInfo.has_car ?  <tr><td className="text-right text-muted">Car Model:</td><th>{ this.props.additionalInfo.car_model }</th></tr> : null}
							{ this.props.additionalInfo.has_car ?  <tr><td className="text-right text-muted">Cost of Car:</td><th>{ getCarCost(this.props.additionalInfo.car_cost) }</th></tr> : null}
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Laptop Owned?:</td><th>{ laptop_owned }</th></tr>
							{ this.props.additionalInfo.laptop_owned ? <tr><td className="text-right text-muted">Laptop Model:</td><th>{ this.props.additionalInfo.laptop_model }</th></tr> : null }
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Mobile Model:</td><th>{ this.props.additionalInfo.mobile_model }</th></tr>
							<tr><td className="text-right text-muted"><span className="text-danger"><b>*</b></span>Camera Resolution:</td><th>{ getCameraResolution(this.props.additionalInfo.camera_resoulution) }</th></tr>
							<tr><td className="text-right text-muted">MSPA Certification code:</td><th>{ this.props.additionalInfo.mspa_code }</th></tr>
						</tbody>
					</table>
					: null }
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		additionalInfo: store.additionalInfo
	};
};

export { AdditionalInfoPanelBase };
export default ReactRedux.connect(mapStoreToProps)(AdditionalInfoPanelBase);

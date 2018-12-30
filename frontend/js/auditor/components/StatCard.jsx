import React from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";

class StatCard extends React.Component {
	static propTypes = {
		title: PropTypes.string,
		image: PropTypes.string,
		count: PropTypes.number,
	};

	render() {
		return (
			<div className="text-center">
				<h3 className="page-header">{this.props.title}</h3>
				<img src={this.props.image} style={{display:"inline-block", width:"70px",height:"70px", marginRight:"20px"}} />
				<h2 style={{display:"inline-block"}}>{this.props.count}</h2>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		firstName: store.profileInfo.first_name,
		lastName: store.profileInfo.last_name,
	};
};

export default ReactRedux.connect(mapStoreToProps)(StatCard);

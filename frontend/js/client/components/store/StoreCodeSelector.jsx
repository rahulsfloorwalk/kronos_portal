import React, { Component } from "react";
import PropTypes from "prop-types";

class StoreCodeSelector extends Component {
	static propTypes = {
		name: PropTypes.string,
		value: PropTypes.string,

		onChange: PropTypes.func.isRequired,
	};

	render() {
		const { name, value, onChange} = this.props;
		const selectStyle = {
			display: "inline-block",
			width: "150px",
		};
		return (
			<div style={selectStyle}>
				&nbsp;<b>Store Code</b>:
				<input type="text" className="form-control" name={name} value={value} onChange={onChange}/>
			</div>
		);
	}
}

export default StoreCodeSelector;
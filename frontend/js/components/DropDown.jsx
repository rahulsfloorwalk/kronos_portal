import React from "react";
import PropTypes from "prop-types";
import "../../css/bs_overrides.scss";
export default class DropDown extends React.Component{
	static propTypes = {
		children: PropTypes.node,
	};

	constructor(props){
		super(props);
		this.state = {
			dropdown: false,
		};
	}

	toggle = () => {
		this.setState({
			dropdown: !this.state.dropdown
		});
	};

	mouseEnter = () => {
		clearTimeout(this.state.dropdownId);
	};

	mouseLeave = () => {
		this.setState({
			dropdownId: setTimeout(this.toggle, 500),
		});
	};

	render(){
		if(this.state.dropdown){
			return (<ul className="dropdown-menu" style={{display:"block", left: "auto"}}
				onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
				{ this.props.children }
			</ul>);
		} else {
			return null;
		}
	}
}

export const DropDownDivider = () => (<li role="separator" className="divider"></li>);

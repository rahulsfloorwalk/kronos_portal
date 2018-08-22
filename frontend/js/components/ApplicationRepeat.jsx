import React from "react";
import PropTypes from "prop-types";

export default class ApplicationRepeat extends React.Component{
  static propTypes: {
    report_exists: PropTypes.bool
  };

  render(){
  	switch(this.props.report_exists){
  	case false:
  		return <strong className="text-success">New</strong>;
  	case true:
  		return <strong className="text-danger">Repeat</strong>;
  	case null:
  		return <span>unkonwn</span>;
  	default:
  		return <strong>unknown</strong>;
  	}
  }
}

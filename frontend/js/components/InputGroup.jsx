import React from 'react';
import Datetime from 'react-datetime';

class InputGroup extends React.Component {
    render() {
		return (
			<div className="input-group">
				{this.props.children}
			</div>
		);
	}
}

class InputGroupBtn extends React.Component {
    render() {
		return (
			<span className="input-group-btn">
				{this.props.children}
			</span>
		);
	}
}

export default InputGroup;
export { InputGroupBtn };

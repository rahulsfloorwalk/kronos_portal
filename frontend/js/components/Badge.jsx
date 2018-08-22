import React from 'react';

export default class extends React.Component {
    render() {
		return (
			<span className="badge">{this.props.children}</span>
		);
	}
}

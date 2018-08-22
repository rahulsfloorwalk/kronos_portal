import React from 'react';

import { Link } from "react-router";

export default class extends React.Component {
    static contextTypes = {
		router: React.PropTypes.object
	};

    render() {
		let isActive = this.context.router.isActive(this.props.to, true);
		let className = isActive ? "active" : "";

		return (
			<li className={className} role="presentation">
				<Link {...this.props}>
					{this.props.children}
				</Link>
			</li>
		);
	}
}

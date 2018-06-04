import React from 'react';

import Header from './Header.jsx';
import Footer from '../../components/Footer.jsx';
import DevelopmentMarker from '../../components/DevelopmentMarker.jsx';

import { fetchConfig } from '../service/config.js';

var App = React.createClass({
	getInitialState: function(){
		return {};
	},
	componentDidMount: function(){
		fetchConfig().done((config) => this.setState({ config }));
	},
	render: function(){
		var contentStyle = {
			'minHeight': "600px"
		};
		return (
			<div>
				<DevelopmentMarker/>
				<Header location={this.props.location}/>
				<div className="container-fluid" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer config={this.state.config}/>
			</div>
		);
	},
});

export default App;

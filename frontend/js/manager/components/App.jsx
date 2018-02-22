import React from 'react';

import Header from './Header.jsx';
import Footer from '../../components/Footer.jsx';
import DevelopmentMarker from '../../components/DevelopmentMarker.jsx';

import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

import { fetchConfig } from "../service/config.js";

var App = React.createClass({
	getInitialState: function(){
		return {
			config: {},
		};
	},
	componentDidMount: function(){
		fetchConfig().then((config) => this.setState({config}));
	},
	render: function(){
		var contentStyle = {
			'minHeight': "600px"
		};
		return (
			<div>
				<DevelopmentMarker/>
				<Header/>
				<div className="container" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer config={this.state.config}/>
				<Alert stack={{limit: 5}} effect="slide"/>
			</div>
		);
	},
});

export default App;

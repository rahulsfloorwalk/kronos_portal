import React from 'react';

import Header from './Header.jsx';
import Footer from '../../js/components/Footer.jsx';
import DevelopmentMarker from '../../js/components/DevelopmentMarker.jsx';

var App = React.createClass({
	render: function(){
		var contentStyle = {
			'minHeight': "600px"
		};
		return (
			<div>
				<DevelopmentMarker/>
				<Header location={this.props.location}/>
				<div className="container" style={contentStyle}>
					{this.props.children}
				</div>
				<Footer/>
			</div>
		);
	},
});

export default App;

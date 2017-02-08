import React from 'react';

import LatestAuditStore from './LatestAuditStore.jsx';

export default React.createClass({
	render: function(){
		return (
			<div className="row">
				<div className="col-md-8">
					<LatestAuditStore/>
				</div>
			</div>
		);
	},
});


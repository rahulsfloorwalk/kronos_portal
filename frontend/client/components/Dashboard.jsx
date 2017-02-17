import React from 'react';

import LatestAuditStore from './LatestAuditStore.jsx';

import { Dashboard } from '../../js/components/Icons.jsx';

export default React.createClass({
	render: function(){
		return (
			<div>
				<h2 className="page-header"><Dashboard/> Dashboard</h2>
				<div className="row">
					<div className="col-md-8">
						<LatestAuditStore/>
					</div>
				</div>
			</div>
		);
	},
});


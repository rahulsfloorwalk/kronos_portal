
const randomApiId = () => Math.random().toString(36).substring(7);

export default {
	report: {
		findByAuditCycleId: randomApiId(),
	},
};

import { fetchReportAttributes } from "../../../manager/actions/report_attribute";
import types from "../../../manager/action_types";
import { fetchReportAttributesByAuditCycleId } from "../../service/report_attribute";

jest.mock("../../service/report_attribute", () => ({
	fetchReportAttributesByAuditCycleId: jest.fn(),
}));

describe("fetchReportAttributes", () => {
	const sampleReportAttributes = [];
	const sampleAuditCycleId = 5;

	it("it dispatches a request before posting to the URL", () => {
		const dispatch = jest.fn();
		const thunk = fetchReportAttributes(sampleAuditCycleId);

		fetchReportAttributesByAuditCycleId.mockResolvedValue(sampleReportAttributes);

		thunk(dispatch);
		setTimeout(() => {
			expect(dispatch).lastCalledWith({
				type: types.REPORT_ATTRIBUTE_GET,
				auditCycleId: sampleAuditCycleId,
				reportAttributes: sampleReportAttributes,
			});
		});
	});
	it("it calls the service with correct parameters", () => {
		const dispatch = jest.fn();
		const thunk = fetchReportAttributes(sampleAuditCycleId);

		fetchReportAttributesByAuditCycleId.mockResolvedValue(sampleReportAttributes);

		thunk(dispatch);
		expect(fetchReportAttributesByAuditCycleId).toBeCalledWith(sampleAuditCycleId);
	});
});


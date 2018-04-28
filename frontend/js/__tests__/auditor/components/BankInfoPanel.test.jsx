import React from "react";
import { shallow } from "enzyme";
import { BankInfoPanelBase } from "../../../auditor/components/BankInfoPanel.jsx";
import renderer from "react-test-renderer";
import $ from "jquery";

describe("<BankInfoPanelBase/>", () => {
	const sampleBankInfo = {
		bank_name_from_ifsc: "State Bank of India",
		account_holder_name: "John Doe",
		account_number: "1234567890",
		ifsc_code: "1234567890",
		pan_number: "1234567890",
	};

	it("is rendered correctly when BankInfo is loading", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		const r = renderer.create(<BankInfoPanelBase bankInfo={{}} dispatch={dispatch}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when BankInfo is successfully loaded", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		const r = renderer.create(<BankInfoPanelBase bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchBankInfo() on mounting", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		shallow(<BankInfoPanelBase bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		expect(dispatch).toBeCalled();
	});

	it("renders inputs with loaded BankInfo", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		const w = shallow(<BankInfoPanelBase bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		w.setProps({bankInfo: sampleBankInfo});
		w.update();

		expect(w.find("table > tbody > tr > th").contains(sampleBankInfo.bank_name_from_ifsc)).toEqual(true);
		expect(w.find("table > tbody > tr > th").contains(sampleBankInfo.account_holder_name)).toEqual(true);
		expect(w.find("table > tbody > tr > th").contains(sampleBankInfo.ifsc_code)).toEqual(true);
		expect(w.find("table > tbody > tr > th").contains(sampleBankInfo.account_number)).toEqual(true);
	});
});

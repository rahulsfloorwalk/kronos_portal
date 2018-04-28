import React from "react";
import { shallow } from "enzyme";
import { BankInfoForm } from "../../../auditor/components/BankInfoForm.jsx";
import renderer from "react-test-renderer";
import $ from "jquery";

describe("<BankInfoForm/>", () => {
	const sampleBankInfo = {
		account_holder_name: "John Doe",
		account_number: "1234567890",
		ifsc_code: "1234567890",
		pan_number: "1234567890",
	};

	it("is rendered correctly when BankInfo is loading", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		const r = renderer.create(<BankInfoForm bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("is rendered correctly when BankInfo is successfully returned", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		//FIXME: this test renders undefined input values
		const r = renderer.create(<BankInfoForm bankInfo={{}} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchBankInfo() on mounting", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		shallow(<BankInfoForm bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		expect(dispatch).toBeCalled();
	});

	it("renders inputs with loaded BankInfo", () => {
		const promise = $.Deferred();
		const dispatch = jest.fn().mockReturnValue(promise);
		const w = shallow(<BankInfoForm bankInfo={sampleBankInfo} dispatch={dispatch}/>);
		promise.resolve(sampleBankInfo);
		w.setProps({bankInfo: sampleBankInfo});
		w.update();

		expect(w.find("FormInput[name='account_holder_name']").props().value).toEqual(sampleBankInfo.account_holder_name);
		expect(w.find("FormInput[name='account_number']").props().value).toEqual(sampleBankInfo.account_number);
		expect(w.find("FormInput[name='ifsc_code']").props().value).toEqual(sampleBankInfo.ifsc_code);
		expect(w.find("FormInput[name='pan_number']").props().value).toEqual(sampleBankInfo.pan_number);
	});
});

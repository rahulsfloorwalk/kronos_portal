import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import values from "object.values";

jest.mock("heic2any");

Enzyme.configure({ adapter: new Adapter() });

values.shim();

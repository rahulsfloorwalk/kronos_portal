
import UserSelectors from "../user";

const sampleUser = {
	"id": 16,
	"full_name": "Foo Bar",
	"client": {    "id": 9,
		"name": "Foobar Corp.",
		"email": "foo@bar.com",
		"phone": "",
		"logo_url": "https://example.com/logo.png",
	},
	"user": {
		"id": 3734,
		"email": "foo@bar.in",
	},
	"is_client_admin": true,
};

const createSampleStore = (namespace, currentUser) => {
	return {
		[namespace]: {
			user: currentUser,
		},
	};
};

describe(UserSelectors, () => {
	const namespace = "foobar";

	describe("findCurrentUser", () => {
		const selectors = new UserSelectors(namespace);

		it("should return the current user", () => {
			const sampleStore = createSampleStore(namespace, sampleUser);
			expect(selectors.findCurrentUser(sampleStore)).toEqual(sampleUser);
		});

		it("should return undefined if the current user is not available", () => {
			const sampleStore = createSampleStore(namespace);
			expect(selectors.findCurrentUser(sampleStore)).toBeUndefined();
		});
	});

	describe("isClientAdmin", () => {
		const selectors = new UserSelectors(namespace);
		it("returns true if the current user is a client admin", () => {
			const sampleStore = createSampleStore(namespace, Object.assign({}, sampleUser, { is_client_admin: true }));
			expect(selectors.isClientAdmin(sampleStore)).toBe(true);
		});

		it("returns false if the current user is not a client admin", () => {
			const sampleStore = createSampleStore(namespace, Object.assign({}, sampleUser, { is_client_admin: false }));
			expect(selectors.isClientAdmin(sampleStore)).toBe(false);
		});

		it("returns false if the current user is not available", () => {
			const sampleStore = createSampleStore(namespace, null);
			expect(selectors.isClientAdmin(sampleStore)).toBe(false);
		});
	});
});


export const findModeratorByUserId = (store, userId) => {
	return store.moderator.find(m => m.id === userId);
};

export const findModerators = (store) => {
	return store.moderator;
};

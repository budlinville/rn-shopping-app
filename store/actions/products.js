export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';

export const deleteProduct = pid => ({ type: DELETE_PRODUCT, pid });

export const createProduct = ( title, description, imageUrl, price ) => {
	return async dispatch => {
		// can write any async code I want now
		const response = await fetch('https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/products.json', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				description,
				imageUrl,
				price
			})
		});

		const respData = await response.json();
		console.log('respData', respData);

		dispatch({
			type: CREATE_PRODUCT,
			productData: {
				id: respData.name,
				title,
				description,
				imageUrl,
				price
			}
		});
	}
};

export const updateProduct = ( id, title, description, imageUrl ) => ({
	type: UPDATE_PRODUCT,
	pid: id,
	productData: {
		title,
		description,
		imageUrl
	}
});
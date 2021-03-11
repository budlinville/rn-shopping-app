import Product from "../../models/product";

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

export const fetchProducts = () => {
	return async dispatch => {
		// can write any async code I want now
		try {
			const response = await fetch('https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/products.json');
			
			if (!response.ok) {
				throw new Error('Something went wrong');
			}

			const respData = await response.json();
			const loadedProducts = respData && Object.entries(respData).map(([key, value]) => new Product(
				key,
				'u1',
				value.title,
				value.imageUrl,
				value.description,
				value.price
			)) || [];
			dispatch({ type: SET_PRODUCTS, products: loadedProducts })
		} catch (err) {
			// maybe send to custom analytics server
			throw err;
		}
	};
};

export const deleteProduct = pid => {
	return async dispatch => {
		const response = await fetch(`https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/products/${pid}.json`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Something went wrong!');
		}

		dispatch({ type: DELETE_PRODUCT, pid });
	};
}

export const createProduct = ( title, description, imageUrl, price ) => {
	return async dispatch => {
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

export const updateProduct = ( id, title, description, imageUrl ) => {
	return async dispatch => {
		const response = await fetch(`https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/products/${id}.json`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				description,
				imageUrl
			})
		});

		if (!response.ok) {
			throw new Error('Something went wrong!');
		}

		dispatch({
			type: UPDATE_PRODUCT,
			pid: id,
			productData: {
				title,
				description,
				imageUrl
			}
		});
	}
};
import Product from "../../models/product";

const firebaseUrl = 'https://rn-complete-guide-785b1-default-rtdb.firebaseio.com';

export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const CREATE_PRODUCT = 'CREATE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_PRODUCTS = 'SET_PRODUCTS';

export const fetchProducts = () => {
	return async (dispatch, getState) => {
		// can write any async code I want now
		const userId = getState().auth.userId;
		try {
			const response = await fetch(`${firebaseUrl}/products.json`);
			
			if (!response.ok) {
				throw new Error('Something went wrong');
			}

			const respData = await response.json();
			const loadedProducts = respData && Object.entries(respData).map(([key, value]) => new Product(
				key,
				value.ownerId,
				value.title,
				value.imageUrl,
				value.description,
				value.price
			)) || [];
			dispatch({
				type: SET_PRODUCTS,
				products: loadedProducts,
				userProducts: loadedProducts.filter(prod => prod.ownerId === userId)
			});
		} catch (err) {
			// maybe send to custom analytics server
			throw err;
		}
	};
};

export const deleteProduct = pid => {
	return async (dispatch, getState) => {
		const token = getState().auth.token;
		const response = await fetch(`${firebaseUrl}/products/${pid}.json?auth=${token}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			throw new Error('Something went wrong!');
		}

		dispatch({ type: DELETE_PRODUCT, pid });
	};
}

export const createProduct = ( title, description, imageUrl, price ) => {
	return async (dispatch, getState) => {
		const token = getState().auth.token;
		const userId = getState().auth.userId;
		const response = await fetch(`${firebaseUrl}/products.json?auth=${token}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				description,
				imageUrl,
				price,
				ownerId: userId
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
				price,
				ownerId: userId
			}
		});
	}
};

export const updateProduct = ( id, title, description, imageUrl ) => {
	return async (dispatch, getState) => {
		const token = getState().auth.token;
		const response = await fetch(`${firebaseUrl}/products/${id}.json?auth=${token}`, {
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

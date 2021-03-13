import PRODUCTS from '../../data/dummy-data';
import Product from '../../models/product';
import { SET_PRODUCTS, DELETE_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT } from '../actions/products';

const initialState = {
	availableProducts: [],
	userProducts: []
};

export default (state=initialState, action) => {
	switch (action.type) {
		case SET_PRODUCTS:
			return {
				availableProducts: action.products,
				userProducts: action.userProducts
			};
		case CREATE_PRODUCT: {
			const { id, title, imageUrl, description, price, ownerId } = action.productData;
			const newProduct = new Product(id, ownerId, title, imageUrl, description, price);
			return {
				...state,
				availableProducts: state.availableProducts.concat(newProduct),
				userProducts: state.availableProducts.concat(newProduct)
			};
		}
		case UPDATE_PRODUCT: {
			const productIndex = state.userProducts.findIndex(prod => prod.id === action.pid);
			const { pid, productData: { title, imageUrl, description } } = action;
			const updatedProduct = new Product(
				pid,
				state.userProducts[productIndex].ownerId,
				title,
				imageUrl,
				description,
				state.userProducts[productIndex].price
			);
			const updatedUserProducts = [...state.userProducts];
			updatedUserProducts[productIndex] = updatedProduct;
			const availableProductIndex = state.availableProducts.findIndex(prod => prod.id === action.pid);
			const updatedAvailableProducts = [...state.availableProducts];
			updatedAvailableProducts[availableProductIndex] = updatedProduct;
			return {
				...state,
				availableProducts: updatedAvailableProducts,
				userProducts: updatedUserProducts
			};
		}
		case DELETE_PRODUCT:
			return {
				...state,
				userProducts: state.userProducts.filter(product => product.id !== action.pid),
				availableProducts: state.availableProducts.filter(product => product.id !== action.pid)
			};
	}
	return state;
};
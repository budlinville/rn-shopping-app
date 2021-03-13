import Order from '../../models/order';

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

const firebaseOrdersUrl = 'https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/orders';

export const fetchOrders = () => {
	return async (dispatch, getState) => {
		const userId = getState().auth.userId;
		try {
			const response = await fetch(`${firebaseOrdersUrl}/${userId}.json`);
			if (!response.ok) {
				throw new Error('Something went wrong');
			}
			const respData = await response.json();
			const loadedOrders = respData && Object.entries(respData).map(([key, value]) => new Order(
				key,
				value.cartItems,
				value.totalAmount,
				new Date(value.date)
			)) || [];
			dispatch({ type: SET_ORDERS, orders: loadedOrders });
		} catch (err) {

		}
	};
};

export const addOrder = (cartItems, totalAmount) => {
	return async (dispatch, getState) => {
		const token = getState().auth.token;
		const userId = getState().auth.userId;
		const date = new Date();
		const response = await fetch(`${firebaseOrdersUrl}/${userId}.json?auth=${token}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				cartItems,
				totalAmount,
				date: date.toISOString()
			})
		});

		if (!response.ok) {
			throw new Error('Something went wrong!');
		}

		const respData = await response.json();

		dispatch({
			type: ADD_ORDER,
			orderData: {
				id: respData.name,
				items: cartItems,
				amount: totalAmount,
				date
			}
		});
	};
};
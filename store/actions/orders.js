import Order from '../../models/order';

export const ADD_ORDER = 'ADD_ORDER';
export const SET_ORDERS = 'SET_ORDERS';

export const fetchOrders = () => {
	return async dispatch => {
		try {
			const response = await fetch('https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/orders/u1.json');
			if (!response.ok) {
				throw new Error('Something went wrong');
			}

			const respData = await response.json();
			// id, items, totalAmount, date
			const loadedOrders = respData && Object.entries(respData).map((entry) => new Order(
				entry[0],	// key
				entry[1].cartItems,
				entry[1].totalAmount,
				new Date(entry[1].date)
			)) || [];
			dispatch({ type: SET_ORDERS, orders: loadedOrders });
		} catch (err) {

		}
	};
};

export const addOrder = (cartItems, totalAmount) => {
	return async dispatch => {
		const date = new Date();
		const response = await fetch('https://rn-complete-guide-785b1-default-rtdb.firebaseio.com/orders/u1.json', {
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
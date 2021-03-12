export const SIGNUP = 'SIGNUP';

export const signup = (email, password) => {
	console.log('email', email);
	console.log('password', password);
	return async dispatch => {
		const response = await fetch(
			'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAxDJ-nJmd0M_OmKOmTeVZQ9eqeG-LXaEw',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					token: 'testing',
					returnSecureToken: true
				})
			}
		);

		if (!response.ok) {
			throw new Error('Something went wrong!');
		}

		const respData = await response.json();

		// TODO: remove this
		console.log(respData);

		dispatch({ type: SIGNUP })
	};
};
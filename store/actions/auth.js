export const SIGNUP = 'SIGNUP';
export const LOGIN = 'LOGIN';

const firebaseAuthUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';
const firebaseAuthKey = 'AIzaSyAxDJ-nJmd0M_OmKOmTeVZQ9eqeG-LXaEw';

export const signup = (email, password) => {
	return async dispatch => {
		const response = await fetch(
			`${firebaseAuthUrl}:signUp?key=${firebaseAuthKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					returnSecureToken: true
				})
			}
		);

		if (!response.ok) {
			const errorRespData = await response.json();
			const errorId = errorRespData.error.message;
			let message = 'Something went wrong!';
			if (errorId === 'EMAIL_EXISTS') {
				message = 'Account tied to this email already exists!';
			}
			throw new Error(message);
		}

		const respData = await response.json();
		dispatch({ type: SIGNUP })
	};
};

export const login = (email, password) => {
	return async dispatch => {
		const response = await fetch(
			`${firebaseAuthUrl}:signInWithPassword?key=${firebaseAuthKey}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					password,
					returnSecureToken: true
				})
			}
		);

		if (!response.ok) {
			const errorRespData = await response.json();
			const errorId = errorRespData.error.message;
			let message = 'Something went wrong!';
			if (errorId === 'EMAIL_NOT_FOUND') {
				message = 'This email could not be found!';
			} else if (errorId === 'INVALID_PASSWORD') {
				message = 'This password is not valid!';
			}
			throw new Error(message);
		}

		const respData = await response.json();
		dispatch({ type: LOGIN })
	};
};
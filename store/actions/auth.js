import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTHENTICATE = 'AUTHENTICATE';

export const authenticate = (userId, token) => ({
	type: AUTHENTICATE, userId, token
});

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
		dispatch(authenticate(respData.localId, respData.idToken));
		const expirationDate = new Date(
			new Date().getTime() + (parseInt(respData.expiresIn) * 1000)
		);
		saveDataToStorage(respData.idToken, respData.localId, expirationDate);
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
		dispatch(authenticate(respData.localId, respData.idToken));
		const expirationDate = new Date(
			new Date().getTime() + (parseInt(respData.expiresIn) * 1000)
		);
		saveDataToStorage(respData.idToken, respData.localId, expirationDate);
	};
};

// persist logged in session
const saveDataToStorage = (token, userId, expirationDate) => {
	AsyncStorage.setItem('userData', JSON.stringify({
		token,
		userId,
		expiryDate: expirationDate.toISOString()
	}));
};
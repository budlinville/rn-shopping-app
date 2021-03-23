import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL';

const firebaseAuthUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';
const firebaseAuthKey = 'AIzaSyAxDJ-nJmd0M_OmKOmTeVZQ9eqeG-LXaEw';

let timer;

export const setDidTryAl = () => ({
	type: SET_DID_TRY_AL
});

export const authenticate = (userId, token, expiryTime) => {
	return dispatch => {
		dispatch(setLogoutTimer(expiryTime));
		dispatch({ type: AUTHENTICATE, userId, token });
	}
};

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
		dispatch(authenticate(
			respData.localId,
			respData.idToken,
			+respData.expiresIn * 1000
		));
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
		dispatch(authenticate(
			respData.localId,
			respData.idToken,
			+respData.expiresIn * 1000
		));
		const expirationDate = new Date(
			new Date().getTime() + (parseInt(respData.expiresIn) * 1000)
		);
		saveDataToStorage(respData.idToken, respData.localId, expirationDate);
	};
};

export const logout = () => {
	clearLogoutTimer();
	// will return a promise.. could handle this asynchronously, but no real
	// reason to do so, since we don't care about result
	AsyncStorage.removeItem('userData');
	return { type: LOGOUT }
};

const clearLogoutTimer = () => {
	if (timer) {
		clearTimeout(timer);
	}
};

// This approach will surely give us a warning on Android as there is no efficient way
// on android devices to handle lengthy timers. Rather, it will keep the timer module running
// in the background, which will deteriorate app performance. There is no good fix, but see
// discussion forum linked in lecture 228 of 'React Native - The Practical Guide [2021 Edition]'
// for possible workarounds
const setLogoutTimer = expirationTime => {
	return dispatch => {
		timer = setTimeout(() => {
			dispatch(logout());
		}, expirationTime);
	}
};

// persist logged in session
const saveDataToStorage = (token, userId, expirationDate) => {
	AsyncStorage.setItem('userData', JSON.stringify({
		token,
		userId,
		expiryDate: expirationDate.toISOString()
	}));
};
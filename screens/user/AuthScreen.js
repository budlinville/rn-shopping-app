import React, { useState, useReducer, useCallback } from 'react';
import {
	View,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	Button
} from 'react-native';
import { useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors'; 
import * as authActions from '../../store/actions/auth';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

// may want to outsource this to seperate file (using hooks..)
// b/c will use this same patterns in multiple places
const formReducer = (state, action) => {
	if (action.type === FORM_INPUT_UPDATE) {
		const updatedValues = {
			...state.inputValues,
			[action.input]: action.value
		};
		const updatedValidities = {
			...state.inputValidities,
			[action.input]: action.isValid
		};
		const updatedFormIsValid = Object.values(updatedValidities).reduce((acc, cur) => acc && cur, true);
		return {
			//...state,
			inputValues: updatedValues,
			inputValidities: updatedValidities,
			formIsValid: updatedFormIsValid
		};
	}
	return state;
};

const AuthScreen = props => {
	const dispatch = useDispatch();
	const [isSignup, setIsSignup] = useState(false);

	const [formState, dispatchFormState] = useReducer(formReducer, {
		inputValues: {
			email: '',
			password: ''
		},
		inputValidities: {
			email: false,
			password: false
		},
		formIsValid: false
	});

	const authHandler = () => {
		const { email, password } = formState.inputValues;
		const action = isSignup
			? authActions.signup( email, password )
			: authActions.login( email, password );
		dispatch(action);
	};

	const inputChangeHandler = useCallback(
		(inputKey, inputValue, inputValidity) => {
			dispatchFormState({
				type: FORM_INPUT_UPDATE,
				value: inputValue,
				isValid: inputValidity,
				input: inputKey
			});
		}, [dispatchFormState]
	);

	return (
		<KeyboardAvoidingView
			behavior='padding'
			keyboardVerticalOffset={50}
			style={styles.screen}>
			<LinearGradient colors={['#ffedff', '#ffe3ff']} style={styles.gradient}>
				<Card style={styles.authContainer}>
					<ScrollView>
						<Input
							id='email'
							label='E-Mail'
							keyboardType='email-address'
							required
							email	
							autoCapitalize='none'
							errorText='Please enter a valid email address.'
							onInputChange={inputChangeHandler}
							initialValue=''
						/>
						<Input
							id='password'
							label='Password'
							keyboardType='default'
							secureTextEntry
							required
							minLength={5}	
							autoCapitalize='none'
							errorText='Please enter a valid password.'
							onInputChange={inputChangeHandler}
							initialValue=''
						/>
						<View style={styles.buttonContainer}>
							<Button
								title={isSignup ? 'Sign Up' : 'Login'}
								color={Colors.primary}
								onPress={authHandler}
							/>
						</View>
						<View style={styles.buttonContainer}>
							<Button
								title={`Switch to ${isSignup ? 'Login' : 'Sign Up'}`}
								color={Colors.accent}
								onPress={() => {
									setIsSignup(prevState => !prevState);
								}}
							/>
						</View>
					</ScrollView>
				</Card>
			</LinearGradient>
		</KeyboardAvoidingView>
	);
};

AuthScreen.navigationOptions = {
	headerTitle: 'Authenticate'
};

const styles = StyleSheet.create({
	screen: {
		flex: 1
	},
	authContainer: {
		width: '80%',
		maxWidth: 400,
		maxHeight: 400,
		padding: 10
	},
	gradient: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	buttonContainer: {
		marginTop: 10
	}
});

export default AuthScreen;
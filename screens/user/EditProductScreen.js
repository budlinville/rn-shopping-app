import React, { useState, useEffect, useCallback, useReducer } from 'react';	// useReducer !== Redux reducer
import {
	View,
	ScrollView,
	StyleSheet,
	Platform,
	Alert,
	KeyboardAvoidingView,
	ActivityIndicator
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productActions from '../../store/actions/products';
import Input from '../../components/UI/Input';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

// can also put this inside component, but if it does not use props,
// might as well put it out here to avoid re-rendering or overhead
// of useCallback
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

const EditProductScreen = props => {
	const prodId = props.navigation.getParam('productId');
	const editedProduct = useSelector(state => state.products.userProducts.find(prod => prod.id === prodId));

	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();

	const [formState, dispatchFormState] = useReducer(formReducer, {
		inputValues: {
			title: editedProduct ? editedProduct.title : '',
			imageUrl: editedProduct ? editedProduct.imageUrl : '',
			description: editedProduct ? editedProduct.description : '',
			price: ''
		},
		// if editing existing product, form has to start as valid; otherwise product wouldn't exist
		// if creating a new product, form can't be valid at start, because all fields are empty
		inputValidities: {
			title: editedProduct ? true : false,
			imageUrl: editedProduct ? true : false,
			description: editedProduct ? true : false,
			price: editedProduct ? true : false,
		},
		formIsValid: editedProduct ? true : false
	});

	useEffect(() => {
		if (error) {
			Alert.alert('An error occurred!', error, [{ text: 'Okay' }]);
		}
	}, [error])

	const submitHandler = useCallback(async () => {
		if (!formState.formIsValid) {
			Alert.alert('Wrong input!', 'Please check the errors in the form.', [
				{ text: 'Okay' }
			]);
			return;
		}
		setError(null);
		setIsLoading(true);
		try {
			if (editedProduct) {
				await dispatch(productActions.updateProduct(
					prodId,
					formState.inputValues.title,
					formState.inputValues.description,
					formState.inputValues.imageUrl
				));
			} else {
				await dispatch(productActions.createProduct(
					formState.inputValues.title,
					formState.inputValues.description,
					formState.inputValues.imageUrl,
					+formState.inputValues.price	// '+' : converts string to number
				));
			}
			props.navigation.goBack();
		} catch (err) {
			setError(err.message);
		}
		setIsLoading(false);
	}, [dispatch, prodId, formState]);

	useEffect(() => {
		props.navigation.setParams({ submit: submitHandler });
	}, [submitHandler]);

	const inputChangeHandler = useCallback((inputKey, inputValue, inputValidity) => {
		dispatchFormState({
			type: FORM_INPUT_UPDATE,
			value: inputValue,
			isValid: inputValidity,
			input: inputKey
		})
	}, [dispatchFormState]);

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	return (
		<KeyboardAvoidingView stle={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={100}>
			<ScrollView>
				<View style={styles.form}>
					<Input
						id='title'
						label='Title'
						errorText='Please enter a valid title!'
						keyboardType='default'	// | number-pad | decimal-pad | numeric | email-address | phone-pad
						autoCapitalize='sentences'
						autoCorrect
						returnKeyType='next'
						onInputChange={inputChangeHandler}
						initialValue={ editedProduct ? editedProduct.title : ''}
						initiallyValid={ !!editedProduct }
						required
					/>
					<Input
						id='imageUrl'
						label='Image Url'
						errorText='Please enter a valid image url!'
						keyboardType='default'
						returnKeyType='next'
						onInputChange={inputChangeHandler}
						initialValue={ editedProduct ? editedProduct.imageUrl : ''}
						initiallyValid={ !!editedProduct }
						required
					/>
					{ editedProduct ? null : (
						<Input
							id='price'
							label='Price'
							errorText='Please enter a valid price!'
							keyboardType='decimal-pad'
							returnKeyType='next'
							initialValue={ editedProduct ? editedProduct.description : ''}
							initiallyValid={ !!editedProduct }
							onInputChange={inputChangeHandler}
							requiredmin={0}
						/>
					)}
					<Input
						id='description'
						label='Description'
						errorText='Please enter a valid description!'
						keyboardType='default'
						onInputChange={inputChangeHandler}
						autoCapitalize='sentences'
						autoCorrect
						multiline
						numberOfLines={3}	// android only
						initialValue={ editedProduct ? editedProduct.description : ''}
						initiallyValid={ !!editedProduct }
						required
						minLength={5}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

EditProductScreen.navigationOptions = navData => {
	const submitFn = navData.navigation.getParam('submit');
	return {
		headerTitle: navData.navigation.getParam('productId')
			? 'Edit Product'
			: 'Add Product',
		headerRight: () => (
			<HeaderButtons HeaderButtonComponent={HeaderButton}>
				<Item
					title='Save'
					iconName={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
					onPress={submitFn}
				/>
			</HeaderButtons>
		)
	};
};

const styles = StyleSheet.create({
	form: {
		margin: 20
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

export default EditProductScreen;
import React, { useEffect, useCallback, useReducer } from 'react';	// useReducer !== Redux reducer
import {
	View,
	ScrollView,
	Text,
	TextInput,
	StyleSheet,
	Platform,
	Alert
} from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import * as productActions from '../../store/actions/products';

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

	const submitHandler = useCallback(() => {
		if (!formState.formIsValid) {
			Alert.alert('Wrong input!', 'Please check the errors in the form.', [
				{ text: 'Okay' }
			]);
			return;
		}
		if (editedProduct) {
			dispatch(productActions.updateProduct(
				prodId,
				formState.inputValues.title,
				formState.inputValues.description,
				formState.inputValues.imageUrl
			));
		} else {
			dispatch(productActions.createProduct(
				formState.inputValues.title,
				formState.inputValues.description,
				formState.inputValues.imageUrl,
				+formState.inputValues.price	// '+' : converts string to number
			));
		}
		props.navigation.goBack();
	}, [dispatch, prodId, formState]);

	useEffect(() => {
		props.navigation.setParams({ submit: submitHandler });
	}, [submitHandler]);

	const textChangeHandler = (input, value) => {
		const isValid = value.trim().length > 0;
		dispatchFormState({
			type: FORM_INPUT_UPDATE,
			value,
			isValid,
			input
		})
	};

	return (
		<ScrollView>
			<View style={styles.form}>
				<View style={styles.formControl}>
					<Text style={styles.label}>Title</Text>
					<TextInput
						style={styles.input}
						value={formState.inputValues.title}
						onChangeText={text => textChangeHandler('title', text)}
						keyboardType='default'	// | number-pad | decimal-pad | numeric | email-address | phone-pad
						autoCapitalize='sentences'
						autoCorrect
						returnKeyType='next'
					/>
					{ !formState.inputValidities.title && <Text>Please enter a valid title!</Text> }
				</View>
				<View style={styles.formControl}>
					<Text style={styles.label}>Image URL</Text>
					<TextInput
						style={styles.input}
						value={formState.inputValues.imageUrl}
						onChangeText={text => textChangeHandler('imageUrl', text)}
					/>
				</View>
				{ editedProduct ? null : <View style={styles.formControl}>
					<Text style={styles.label}>Price</Text>
					<TextInput
						style={styles.input}
						value={formState.inputValues.price}
						onChangeText={text => textChangeHandler('price', text)}
						keyboardType='decimal-pad'
					/>
				</View>}
				<View style={styles.formControl}>
					<Text style={styles.label}>Description</Text>
					<TextInput
						style={styles.input}
						value={formState.inputValues.description}
						onChangeText={text => textChangeHandler('description', text)}
					/>
				</View>
			</View>
		</ScrollView>
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
	formControl: {
		width: '100%'
	},
	label: {
		fontFamily: 'open-sans-bold',
		marginVertical: 8
	},
	input: {
		paddingHorizontal: 2,
		paddingVertical: 5,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1
	}
});

export default EditProductScreen;
import React, { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Button,
	Platform,
	ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import ProductItem from '../../components/shop/ProductItem';
import * as cartActions from '../../store/actions/cart';
import * as productsActions from '../../store/actions/products';
import HeaderButton from '../../components/UI/HeaderButton';
import Colors from '../../constants/Colors'

const ProductsOverviewScreen = props => {
	const dispatch = useDispatch();
	const [error, setError] = useState();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const products = useSelector(state => state.products.availableProducts);

	const loadProducts = useCallback(async () => {
		setError(null);
		setIsRefreshing(true);
		try {
			await dispatch(productsActions.fetchProducts());
		} catch (err) {
			setError(err.message)
		}
		setIsRefreshing(false);
	}, [dispatch, setIsLoading, setError]);

	// Below code will re-render the products every time I go to ProductsOverview drawer
	// This doesn't happen automatically for a drawer navigator. Rather drawer navigator
	// keeps all data for all drawers in memory.
	// (Stack navigator is different)
	// This way, if value changes somewhere else, this will be reflected when I visit
	// this drawer again
	// (Is not real-time updates though... need AWS AppSync for that)
	const { navigation } = props;
	useEffect(() => {
		const willFocusSubscription = navigation.addListener('willFocus', loadProducts);
		return () => {
			willFocusSubscription.remove();
		};
	}, [loadProducts, navigation]);

	useEffect(() => {
		setIsLoading(true);
		loadProducts().then( () => setIsLoading(false) );	// old syntax; could also use await
	}, [dispatch, loadProducts]);

	const selectItemHandler = (id, title) => {
		props.navigation.navigate('ProductDetail', {
			productId: id,
			productTitle: title
		});
	};

	if (error) {
		return (
			<View style={styles.centered}>
				<Text>An error occurred...</Text>
				<Button title='Try again' onPress={loadProducts} color={Colors.primary} />
			</View>
		);
	}

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color={Colors.primary} />
			</View>
		);
	}

	if (!isLoading && products.length === 0) {
		return (
			<View style={styles.centered}>
				<Text>No products found. Maybe start adding some!</Text>
			</View>
		);
	}

	return (
		<FlatList
			onRefresh={loadProducts}
			refreshing={isRefreshing}
			data={products}
			renderItem={ itemData => (
				<ProductItem
					image={itemData.item.imageUrl}
					title={itemData.item.title}
					price={itemData.item.price}
					onSelect={ () => selectItemHandler(itemData.item.id, itemData.item.title) }
				>
					<Button
						color={Colors.primary}
						title='View Details'
						onPress={ () => selectItemHandler(itemData.item.id, itemData.item.title) }
					/>
					<Button
						color={Colors.accent}
						title='To Cart'
						onPress={ () => dispatch(cartActions.addToCart(itemData.item)) }
					/>
				</ProductItem>
			)}
		/>
	);
};

ProductsOverviewScreen.navigationOptions = navData => {
	return {
		headerTitle: 'All Products',
		headerLeft: () => (
			<HeaderButtons HeaderButtonComponent={HeaderButton}>
				<Item
					title='Menu'
					iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
					onPress={() => {
						navData.navigation.toggleDrawer();
					}}
				/>
			</HeaderButtons>
		),
		headerRight: () => (
			<HeaderButtons HeaderButtonComponent={HeaderButton}>
				<Item
					title='Cart'
					iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
					onPress={() => {
						navData.navigation.navigate('Cart');
					}}
				/>
			</HeaderButtons>
		)
	}
};

const styles = StyleSheet.create({
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
})

export default ProductsOverviewScreen;

import React from 'react';
import { FlatList, Button, Platform, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import ProductItem from '../../components/shop/ProductItem';
import HeaderButton from '../../components/UI/HeaderButton';
import Colors from '../../constants/Colors';
import * as productsActions from '../../store/actions/products';

const UserProductsScreen = props => {
	const dispatch = useDispatch();
	const userProducts = useSelector(state => state.products.userProducts);

	const editProductHandler = id => {
		props.navigation.navigate('EditProduct', {productId: id});
	};

	const deleteHandler = id => {
		Alert.alert(
			'Are you sure?',
			'Do you really want to delete this item?',
			[
				{ text: 'No', style: 'default' },
				{
					text: 'Yes',
					style: 'destructive',
					onPress: () => {
						dispatch(productsActions.deleteProduct(id))
					}
				}
			]
		)
	};

	return (
		<FlatList
			data={userProducts}
			keyExtractor={item => item.id}
			renderItem={ itemData => (
				<ProductItem
					title={itemData.item.title}
					price={itemData.item.price}
					image={itemData.item.imageUrl}
					onSelect={ () => editProductHandler(itemData.item.id) }>
					<Button
						color={Colors.primary}
						title='Edit'
						onPress={ () => editProductHandler(itemData.item.id) }
					/>
					<Button
						color={Colors.accent}
						title='Delete'
						onPress={ () => deleteHandler(itemData.item.id) }
					/>
				</ProductItem>
			)}
		/>
	);
};

UserProductsScreen.navigationOptions = navData => ({
	headerTitle: 'Your Products',
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
				title='Add'
				iconName={Platform.OS === 'android' ? 'md-create' : 'ios-create'}
				onPress={() => {
					navData.navigation.navigate('EditProduct');
				}}
			/>
		</HeaderButtons>
	)
});

export default UserProductsScreen;
import {Container} from 'unstated';
import {products} from '../api';

export default class ProductsContainer extends Container {

	state = {
		products: [],
		loaded: false
	};

	load = () => {
		products().then(result => {
			this.setState({products: result, loaded: true});
		})
	};

	all = () => {
		if (this.state.loaded) {
			return this.state.products;
		} else {
			this.load();
			return [];
		}
	};

	byName = (name) => {
		const candidates = this.all().filter(p => 
			p.name === name
		);
		if (candidates.length > 0) {
			return candidates[0];
		} else {
			return null;
		}
	}

}


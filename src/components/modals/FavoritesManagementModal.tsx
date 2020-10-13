import React from "react";

import FavoritePortSelector from "./components/FavoritePortSelector";

interface IProps {}
interface IState {}

function handleSelect() {
    return;
}

export default class FavoritesManagementModal extends React.PureComponent<IProps, IState> {
    render() {
        return <FavoritePortSelector subscriptions={[]} handleSelect={handleSelect} managementOnly={true} />;
    }
}

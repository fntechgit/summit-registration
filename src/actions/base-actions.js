export const RESET_STATE = 'RESET_STATE';

export const resetState = () => (dispatch) => {
    dispatch(createAction(RESET_STATE)({}));
};

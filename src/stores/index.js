import { configureStore } from "@reduxjs/toolkit";
import apiDataReducer from "./slicer/apiDataSlicer";
import appReducer from "./reducers/appReducer";


export default configureStore({
    reducer: {
        apiData: apiDataReducer,
        app: appReducer
    }
})


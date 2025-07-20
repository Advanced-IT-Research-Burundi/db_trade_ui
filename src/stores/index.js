import { configureStore } from "@reduxjs/toolkit";
import apiDataReducer from "./slicer/apiDataSlicer";


export default configureStore({
    reducer: {
        apiData : apiDataReducer
    }
})

